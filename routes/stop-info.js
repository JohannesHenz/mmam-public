const fs = require('fs');
const db = require('../database/index.js');
const csvParser = require('csv-parser');
const router = require('express-promise-router')();
const axios = require('axios');
const path = require('path');


let wienerLinienData = null;

// Function to fetch data from Wiener Linien API using stopId
async function fetchWienerLinienData(StopID) {
    const url = `https://www.wienerlinien.at/ogd_realtime/monitor?stopId=${StopID}`;
    console.log('URL:', url); // Debugging line


    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    try {
        console.log('Fetching data from Wiener Linien API...');
        const response = await axios(url, options);

        console.log('Wiener Linien API response:', response.data); // Debugging line


        if (!response.data || !response.data.data) {
            console.error('Invalid response from Wiener Linien API:', response.data);
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

        console.log('Wiener Linien data fetched successfully:', monitorInfo);
        return monitorInfo;
    } catch (error) {
        console.error('Error fetching data from Wiener Linien API:', error);
        throw new Error('Error fetching data from Wiener Linien API');
    }
}


router.post('/', async (request, response) => {
    console.log('POST request to /wienerlinien/stop-info received');
    console.log('Request Body:', request.body); // Log the entire request body

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
        console.log('Attempting to get stopId for stopName:', stopName);

        const query = 'SELECT "stopid" FROM "haltepunkte" WHERE TRIM("stoptext") = $1';
        const result = await db.query(query, [stopName]);
        
        const StopID = result.rows[0]?.stopid;

        console.log('Resolved stopId:', StopID);

        return StopID;
    } catch (error) {
        console.error('Error while getting stopId:', error);
        return null;
    }
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
            console.log('Inserting row:', row);
        
            // Check if there is a StopID for the row
            if (row.StopID !== undefined && row.StopID !== null && row.StopID !== "") {
                const stopId = parseInt(row.StopID);
                const diva = parseInt(row.DIVA);
                const municipalityId = parseInt(row.MunicipalityID);
        
                if (!isNaN(stopId) && !isNaN(diva) && !isNaN(municipalityId)) {
                    await db.query(insertQuery, [
                        stopId,
                        diva,
                        row.StopText,
                        row.Municipality,
                        municipalityId,
                        parseFloat(row.Longitude),
                        parseFloat(row.Latitude)
                    ]);
        
                    // Check if the StopID is 9999 and stop the loop
                    if (stopId === 9999) {
                        console.log('Reached StopID 9999. Stopping insertion.');
                        break;
                    }
                } else {
                    console.log(`Skipping row with invalid data: StopID=${row.StopID}, DIVA=${row.DIVA}, MunicipalityID=${row.MunicipalityID}`);
                }
            } else {
                console.log('Skipping row with missing StopID.');
            }
        }

        // Commit the transaction if all inserts succeed
        await db.query('COMMIT');
    } catch (error) {
        // Rollback the transaction if an error occurs
        await db.query('ROLLBACK');
        throw error;
    }
}


async function fetchAndSyncWienerLinienDataPeriodically(StopID) {
    
        try {
            console.log('Fetching and updating Wiener Linien data...');
            
            // Fetch data from Wiener Linien
            const newData = await fetchWienerLinienData(StopID);

            // Update the database with the new data
            //await updateDatabaseWithWienerLinienData(newData);

            console.log('Wiener Linien data updated successfully.');
        } catch (error) {
            console.error('Error fetching and updating Wiener Linien data:', error);
        }
   // Fetch and update every 30 seconds
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


module.exports = router;