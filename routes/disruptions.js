const router = require('express-promise-router')();
const axios = require('axios');
const logger = require('../utils/logger');

router.get('/', async (request, response) => {
    try {
        const disruptions = await fetchDisruptions();
        response.json(disruptions);
    } catch (error) {
        logger.error(`Error in GET /disruptions: ${error.message}`);
        response.status(500).send("Internal Server Error");
    }
});

async function fetchDisruptions() {
    try {
        const response = await axios.get('https://www.wienerlinien.at/ogd_realtime/trafficInfoList');
        const data = response.data.data.trafficInfos;

        // Process and categorize disruptions, filtering out non-informative ones
        const processed = data
            .filter(info => {
                // Filter out disruptions with no related lines or stops
                if (!info.relatedLines || !info.relatedLines.length || 
                    !info.relatedStops || !info.relatedStops.length) {
                    return false;
                }
                
                // Filter out disruptions with generic/uninformative titles
                const uninformativeTitles = ['Bauarbeiten Kein Betrieb!', 'Kein Betrieb!'];
                return !uninformativeTitles.includes(info.title);
            })
            .map(info => ({
                id: info.refTrafficInfoId,
                type: info.type,
                category: info.category,
                title: info.title,
                description: info.description,
                priority: info.priority,
                time: info.time,
                relatedLines: info.relatedLines,
                relatedStops: info.relatedStops,
                elevator: info.type === 'elevator',
            }));

        return processed;
    } catch (error) {
        logger.error(`Error fetching disruptions: ${error.message}`);
        throw error;
    }
}

module.exports = router;