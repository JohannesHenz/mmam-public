const fs = require('fs');
const db = require('../database/index.js');
const csvParser = require('csv-parser');
const router = require('express-promise-router')();
const axios = require('axios');
const path = require('path');


// Function to fetch data from Wiener Linien API using stopId
async function fetchWienerLinienData(StopID) {
    const url = `https://www.wienerlinien.at/ogd_realtime/monitor?stopId=${StopID}`;

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
    const StopID = await getStopId(stopName);
    console.log('Resolved stopId:', StopID);

    if (!StopID) {
        response.status(404).json({ error: 'Stop not found' });
        return;
    }

    try {
        // Fetch data using the obtained stopId
        const wienerLinienResponse = await fetchWienerLinienData(StopID);
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
        const StopID = result.rows[0]?.StopID;

        return StopID;
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
                const StopID = row.StopID;

                stopIdMap[stopName] = StopID;
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

//Function to check if the database is connected
function checkDatabaseConnectionPeriodically() {
    const intervalId = setInterval(async () => {
        if (db.connected) {
            clearInterval(intervalId); // Stop when connected
            console.log('Database connected. Running populateDatabase.');
            await populateDatabase();
        } else {
            console.log('Database not connected. Retrying...');
        }
    }, 3000); // Check every 3 seconds
}

async function populateDatabase() {
    await downloadCSVFile();

    try {
        // Check if the database is connected
        if (!db.connected) {
            console.error('Database is not connected. Aborting database population.');
            return;
        }

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
    const insertQuery = 'INSERT INTO haltepunkte (stopid, diva, stoptext, municipality, municipalityid, longitude, latitude) VALUES ($1, $2, $3, $4, $5, $6, $7)';

    // Begin a transaction
    await db.query('BEGIN');

    try {

        for (const row of data) {
            console.log('Inserting row:', row); } //DEBUG

         

        for (const row of data) {

            const StopID = parseInt(row.StopID);

         if (isNaN(StopID)) {
            console.log(`Skipping row with invalid StopID: ${row.StopID}`);
            continue; // Skip this row
        }


            await db.query(insertQuery, [
                parseInt(row.StopID),
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


function fetchAndSyncWienerLinienDataPeriodically(StopID) {
    setInterval(async () => {
        try {
            console.log('Fetching and updating Wiener Linien data...');
            
            // Fetch data from Wiener Linien
            const newData = await fetchWienerLinienData(StopID);

            // Update the database with the new data
            await updateDatabaseWithWienerLinienData(newData);

            console.log('Wiener Linien data updated successfully.');
        } catch (error) {
            console.error('Error fetching and updating Wiener Linien data:', error);
        }
    }, 30000); // Fetch and update every 30 seconds
}



// Function to update the database with new Wiener Linien data
async function updateDatabaseWithWienerLinienData(newData) {
    try {
        // Check if the database is connected
        if (!db.connected) {
            console.error('Database is not connected. Aborting database update.');
            return;
        }

        // Begin a transaction
        await db.query('BEGIN');

        // Clear existing data in the database
        await db.query('DELETE FROM wienerlinien_data');

        // Insert the new data into the database
        for (const row of newData) {
            await db.query('INSERT INTO wienerlinien_data ("MonitorTitle", "LineName", "Towards", "DepartureTime") VALUES ($1, $2, $3, $4)', [
                row.monitorTitle,
                row.lineInfo.Name,
                row.lineInfo.towards,
                row.lineInfo.departureTime
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

fetchAndSyncWienerLinienDataPeriodically();

checkDatabaseConnectionPeriodically();
// Call the function to populate the database when the script is executed
populateDatabase();


module.exports = router