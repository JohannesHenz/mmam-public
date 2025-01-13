const database = require('../database');
const router = require('express-promise-router')();
const logger = require('../utils/logger');
const axios = require('axios');
const iconv = require('iconv-lite');

router.get('/suggestions', async (req, res) => {
    try {
        const suggestions = await fetchSuggestions(req.query.stationName);
        res.json(suggestions);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'An error occurred while fetching station suggestions' });
    }
});

router.get('/', async (req, res) => {
    try {
        const data = await fetchStationData(req.query.stationName);
        res.json(data);  // Send stationId, latitude, and longitude to the frontend
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'An error occurred while fetching station data' });
    }
});

// Fetch station ID, latitude, and longitude from the database
async function fetchStationData(stationName) {
    try {
      // Use ILIKE to do a case-insensitive match
      const query = `
        SELECT stationID, latitude, longitude
        FROM stationoebb
        WHERE stationName ILIKE '%' || $1 || '%'
        LIMIT 1
      `;
      const { rows } = await database.query(query, [stationName]);
  
      if (rows.length === 0) {
        // Fallback if no station found
        return { stationId: 1392068, latitude: '16.376953', longitude: '48.239317' }; 
      }
      return rows[0];
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
  

async function fetchSuggestions(stationName) {
    stationName = stationName || 'Wien';
    const url = `http://fahrplan.oebb.at/bin/ajax-getstop.exe/dn?REQ0JourneyStopsS0A=&REQ0JourneyStopsB=500&S=${stationName}?&js=true&=`;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        let data = iconv.decode(Buffer.from(response.data), 'ISO-8859-1');
        data = data.replace('SLs.sls=', '');
        data = data.replace(';SLs.showSuggestion();', '');
        data = JSON.parse(data);

        // Loop through each suggestion and insert it into the database if it doesn't already exist
        for (const suggestion of data.suggestions) {
            const stationId = suggestion.extId;
            const stationName = suggestion.value;
            const longitude = suggestion.xcoord;
            const latitude = suggestion.ycoord;

            // Check if the station exists
            const exists = await stationExists(stationId);

            if (!exists) {
                // Insert the station if it doesn't exist
                await insertStation(stationName, stationId, longitude, latitude);
            }
        }

        return data;
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

// Helper function to check if station exists in the database
async function stationExists(stationId) {
    try {
        const data = await database.query('SELECT * FROM stationoebb WHERE stationID = $1', [stationId]);
        return data.rows.length > 0;
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

function insertDotAfterFirstTwoDigits(coordinate) {
    const coordinateStr = coordinate.toString();
    if (coordinateStr.length > 2) {
        return coordinateStr.slice(0, 2) + '.' + coordinateStr.slice(2);
    }
    return coordinateStr;
}

// Helper function to insert a new station into the database with longitude and latitude
async function insertStation(stationName, stationId, longitude, latitude) {
    try {
        return await database.query(
            'INSERT INTO stationoebb (stationName, stationID, longitude, latitude) VALUES ($1, $2, $3, $4)', 
            [stationName, stationId, insertDotAfterFirstTwoDigits(longitude), insertDotAfterFirstTwoDigits(latitude)]
        );
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

router.get('/stations', async (req, res) => {
    try {
        const query = 'SELECT stationid, stationName, latitude, longitude FROM stationoebb';
        const result = await database.query(query);
        const stations = result.rows;
        res.json(stations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

module.exports = router;
