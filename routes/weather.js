const database = require("../database");
const router = require("express-promise-router")();
const axios = require("axios");
const logger = require("../utils/logger");
const { getLocation } = require("../utils/location");

router.get("/", async (request, response) => {
  try {
    const weatherData = await fetchWeather();
    response.json(weatherData);
  } catch (error) {
    logger.error(`Error in GET /weather: ${error.message}`);
    response.status(500).send("Internal Server Error");
  }
});

module.exports = router;
module.exports.convertForecast = convertForecast;

async function fetchWeather() {
  try {
    return await fetchForecast();
  } catch (error) {
    logger.error(`Error in fetchWeather: ${error.message}`);
    throw error;
  }
}

async function fetchForecast() {
  logger.debug("fetchForecast()");

  const { latitude, longitude } = getLocation(); // Get location from the shared module

  if (!latitude || !longitude) {
    logger.error("User location is not available");
    throw new Error("User location is not available");
  }

  logger.debug(`Using latitude: ${latitude}, longitude: ${longitude}`);

  const now = new Date();
  const start = new Date(now.setMinutes(0, 0, 0));
  const end = new Date(start.getTime() + 6 * 60 * 60 * 1000); // Add 6 hours

  const timezoneOffset = start.getTimezoneOffset() * 60000; // Correct for Vienna timezone (CET or CEST)
  const startISO = new Date(start - timezoneOffset).toISOString().slice(0, 19);
  const endISO = new Date(end - timezoneOffset).toISOString().slice(0, 19);

  logger.error(startISO);
  const url = `https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nwp-v1-1h-2500m?parameters=t2m,sy&lat_lon=${latitude}%2C${longitude}&start=${startISO}&end=${endISO}`;

  try {
    const response = await axios.get(url);
    logger.debug(`Forecast API response: ${JSON.stringify(response.data)}`);

    return convertForecast(response.data);
  } catch (error) {
    logger.error(`Error fetching forecast data: ${error.message}`);
    throw error;
  }
}

function convertForecast(data) {
  const timestamps = data.timestamps;

  return timestamps.map((timestamp, index) => {
    return {
      timestamp,
      temperature: Math.round(
        data.features[0].properties.parameters.t2m.data[index]
      ),

      symbol: data.features[0].properties.parameters.sy.data[index],
    };
  });
}
