const fs = require('fs');
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
        const csvFilePath = path.join(__dirname, '..', 'wienerlinien', 'wienerlinien-ogd-haltepunkte.csv');
        const stopIdMap = await loadStopIdMap(csvFilePath);
        const stopId = stopIdMap[stopName.toLowerCase()];

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

module.exports = router