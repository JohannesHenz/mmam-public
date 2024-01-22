const database = require('../database');
const router = require('express-promise-router')();
const logger = require('../utils/logger');
const axios = require('axios');
const iconv = require('iconv-lite');

router.get('/suggestions', async (req, res) => {
    try {
        const journeys = await fetchSuggestions(req.query.stationName);
        res.json(journeys);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'An error occurred while fetching journeys data' });
    }
});

router.get('/', async (req, res) => {
    try {
        const stationId = await fetchStationId(req.query.stationName);
        const journeys = await fetchJourney(stationId);
        res.json(journeys);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'An error occurred while fetching journeys data' });
    }
});

async function fetchStationId(stationName) {
    try {
        const data = await database.query('SELECT * FROM station WHERE stationName = $1', [stationName]);
        if (data.rows.length === 0) {
            return 1292001;
        }
        return data.rows[0].stationid;
    }
    catch (error) {
        logger.error(error);
    }
}

async function fetchSuggestions(stationName) {
    stationName = stationName || 'Wien';
    const url = `http://fahrplan.oebb.at/bin/ajax-getstop.exe/dn?REQ0JourneyStopsS0A=&REQ0JourneyStopsB=12&S=${stationName}?&js=true&=`;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        let data = iconv.decode(Buffer.from(response.data), 'ISO-8859-1');
        data = data.replace('SLs.sls=', '');
        data = data.replace(';SLs.showSuggestion();', '');
        data = JSON.parse(data);
        data.suggestions.forEach(async (suggestion) => {
            const stationName = suggestion.value;
            const stationId = suggestion.extId;
            if (!(await stationExists(stationId))) {
                await insertStation(stationName, stationId);
            }
        });
        return data;
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

async function insertStation(stationName, stationId) {
    try {
        database.query('INSERT INTO station (stationName, stationID) VALUES ($1, $2)', [stationName, stationId]);
    }
    catch (error) {
        logger.error(error);
    }
}

async function stationExists(stationId) {
    try {
        const data = await database.query('SELECT * FROM station WHERE stationID = $1', [stationId]);
        if (data.rows.length === 0) {
            return false;
        }
        return true;
    }
    catch (error) {
        logger.error(error);
    }
}

async function fetchJourney(stationId) {
    stationId = stationId;
    const url = `https://fahrplan.oebb.at/bin/stboard.exe/dn?L=vs_scotty.vs_liveticker&evaId=${stationId}&boardType=dep&time=now&productsFilter=1011111111011&additionalTime=0&maxJourneys=50&outputMode=tickerDataOnly&start=yes&selectDate=today`;
    try {
        const response = await axios.get(url);
        //replace 'journeysObj =' 
        response.data = response.data.replace(/journeysObj = /g, '');
        //parse string to json
        response.data = JSON.parse(response.data);
        //TODO databse insert
        return response.data;
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

module.exports = router;
