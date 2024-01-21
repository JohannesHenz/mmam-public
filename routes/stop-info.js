const fs = require('fs');
const db = require('../database/index.js');
const csvParser = require('csv-parser');
const router = require('express-promise-router')();
const axios = require('axios');
const path = require('path');


// Function to fetch data from Wiener Linien API using stopId
async function fetchWienerLinienData(stopId) {
    const url = `https://www.wienerlinien.at/ogd_realtime/monitor?stopId=${stopId}`;

    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await axios(url, options);

        if (!response.data || !response.data.data) {
            throw new Error('Invalid response from Wiener Linien API');
        }

        const data = response.data.data;

        const monitorInfo = data.monitors.map(monitor => {
            const monitorTitle = monitor.locationStop.properties.title;
            const lineInfo = monitor.lines.map(line => {
                const departureTime = new Date(line.departures.departure[0].departureTime.timeReal);
                const formattedDepartureTime = new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: false
                }).format(departureTime);

                return {
                    name: line.name,
                    towards: line.towards,
                    departureTime: formattedDepartureTime
                };
            });

            return {
                monitorTitle,
                lineInfo
            };
        });

        return monitorInfo;
    } catch (error) {
        throw new Error('Error fetching data from Wiener Linien API');
    }
}

router.post('/', async (request, response) => {
    console.log('POST request to /wienerlinien/stop-info received');
    const stopName = request.body.stopName;
    console.log('Received stopName:', stopName);


    // Look up the stopId based on the stopName
    const stopId = await getStopId(stopName);
    console.log('Resolved stopId:', stopId);

    if (!stopId) {
        response.status(404).json({ error: 'Stop not found' });
        return;
    }

    try {
        // Fetch data using the obtained stopId
        const wienerLinienResponse = await fetchWienerLinienData(stopId);
        console.log('Wiener Linien response:', wienerLinienResponse);

        // Send the Wiener Linien data back to the frontend
        response.json(wienerLinienResponse);
    } catch (error) {
        console.error('Error fetching Wiener Linien data:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

// Function to look up stopId based on stopName
async function getStopId(stopName) {
    try {
        const query = 'SELECT "StopID" FROM "haltepunkte" WHERE "StopText" = $1';
        const result = await db.query(query, [stopName.toLowerCase()]);
        const stopId = result.rows[0]?.StopID;

        return stopId;
    } catch (error) {
        console.error('Error while getting stopId:', error);
        return null;
    }
}


async function loadStopIdMap(csvFilePath) {
    return new Promise((resolve, reject) => {
        const stopIdMap = {};

        fs.createReadStream(csvFilePath)
            .pipe(csvParser({ separator: ';' }))
            .on('data', (row) => {
                const stopName = row.StopText.toLowerCase();
                const stopId = row.StopID;

                stopIdMap[stopName] = stopId;
            })
            .on('end', () => {
                resolve(stopIdMap);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

const csvFilePath = path.join(__dirname, '..', 'wienerlinien', 'wienerlinien-ogd-haltepunkte.csv');


async function downloadCSVFile() {
    try {
        // Check if the CSV file already exists
        if (!fs.existsSync(csvFilePath)) {
            console.log('Downloading CSV file...');

            // Download the CSV file from the provided link
            const response = await axios.get('https://www.wienerlinien.at/ogd_realtime/doku/ogd/wienerlinien-ogd-haltepunkte.csv', { responseType: 'arraybuffer' });

            
            // Save the downloaded CSV file
            fs.writeFileSync(csvFilePath, response.data);

            console.log('CSV file downloaded successfully.');
        } else {
            console.log('CSV file already exists.');
        }
    } catch (error) {
        console.error('Error downloading CSV file:', error);
    }
}

async function populateDatabase() {
    await downloadCSVFile();

    try {
        const data = await readCSV(csvFilePath);

        if (data.length > 0) {
            await insertDataIntoDatabase(data);
            console.log('Data inserted into the database successfully.');
        } else {
            console.log('No data to insert.');
        }
    } catch (error) {
        console.error('Error populating database:', error);
    } finally {
        // Close the database connection when done
        await db.query('ROLLBACK');
    }
}

async function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const data = [];

        fs.createReadStream(filePath)
            .pipe(csvParser({ separator: ';' }))
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', () => {
                resolve(data);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

async function insertDataIntoDatabase(data) {
    const insertQuery = 'INSERT INTO haltepunkte ("StopID", "DIVA", "StopText", "Municipality", "MunicipalityID", "Longitude", "Latitude") VALUES ($1, $2, $3, $4, $5, $6, $7)';

    // Begin a transaction
    await db.query('BEGIN');

    try {
        for (const row of data) {
            await db.query(insertQuery, [
                row.StopID,
                parseInt(row.DIVA),
                row.StopText,
                row.Municipality,
                parseInt(row.MunicipalityID),
                parseFloat(row.Longitude),
                parseFloat(row.Latitude)
            ]);
        }

        // Commit the transaction if all inserts succeed
        await db.query('COMMIT');
    } catch (error) {
        // Rollback the transaction if an error occurs
        await db.query('ROLLBACK');
        throw error;
    }
}

// Call the function to populate the database when the script is executed
populateDatabase();

module.exports = router