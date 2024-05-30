const database = require("../database");
const router = require("express-promise-router")();
const axios = require("axios");
const logger = require("../utils/logger");
const { getLocation } = require('../utils/location');

router.get("/", async (request, response) => {
  try {
    const weatherData = await fetchWeather();
    response.json(weatherData);
  } catch (error) {
    logger.error(`Error in GET /weather: ${error.message}`);
    response.status(500).send('Internal Server Error');
  }
});

module.exports = router;

async function fetchWeather() {
  try {
    const openWeather = await fetchOpenWeather();
    const forecast = await fetchForecast();
    return { ...openWeather, forecast: forecast };
  } catch (error) {
    logger.error(`Error in fetchWeather: ${error.message}`);
    throw error;
  }
}

async function fetchOpenWeather() {
  logger.debug("fetchOpenWeather()");

  const apiKey = '1af530a8a7429bd4fb34d410aca8f0b0';  // Use dotenv to manage the API key
  const { latitude, longitude } = getLocation(); // Get location from the shared module

  if (!latitude || !longitude) {
    logger.error('User location is not available');
    throw new Error('User location is not available');
  }

  logger.debug(`Using latitude: ${latitude}, longitude: ${longitude}`);
  logger.debug(`Using OpenWeather API Key: ${apiKey ? 'Key found' : 'Key not found'}`);

  const units = "metric";
  const lang = "en";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&lang=${lang}&appid=${apiKey}`;

  try {
    const response = await axios.get(url);
    logger.debug(`OpenWeather API response: ${JSON.stringify(response.data)}`);

    await database.query(
      `
    INSERT INTO weather (timestamp, timezone, longitude, latitude, weather_id, weather_main, weather_description, weather_icon, main_temp, main_pressure, main_humidity, main_temp_min, main_temp_max, wind_speed, wind_deg, wind_gust, clouds_all) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 , $11, $12, $13, $14, $15, $16, $17)
    ON CONFLICT (timestamp, longitude, latitude) 
    DO UPDATE SET weather_id = EXCLUDED.weather_id, weather_main = EXCLUDED.weather_main, weather_description = EXCLUDED.weather_description, weather_icon = EXCLUDED.weather_icon, main_temp = EXCLUDED.main_temp, main_pressure = EXCLUDED.main_pressure, main_humidity = EXCLUDED.main_humidity, main_temp_min = EXCLUDED.main_temp_min, main_temp_max = EXCLUDED.main_temp_max, wind_speed = EXCLUDED.wind_speed, wind_deg = EXCLUDED.wind_deg, wind_gust = EXCLUDED.wind_gust, clouds_all = EXCLUDED.clouds_all
`,
      [
        response.data.dt,
        response.data.timezone,
        response.data.coord.lon,
        response.data.coord.lat,
        response.data.weather[0].id,
        response.data.weather[0].main,
        response.data.weather[0].description,
        response.data.weather[0].icon,
        response.data.main.temp,
        response.data.main.pressure,
        response.data.main.humidity,
        response.data.main.temp_min,
        response.data.main.temp_max,
        response.data.wind.speed,
        response.data.wind.deg,
        response.data.wind.gust,
        response.data.clouds.all,
      ]
    );
    return convertOpenWeather(response.data);
  } catch (error) {
    logger.error(`Error fetching OpenWeather data: ${error.message}`);
    throw error;
  }
}

async function fetchForecast() {
  logger.debug("fetchForecast()");

  const { latitude, longitude } = getLocation(); // Get location from the shared module

  if (!latitude || !longitude) {
    logger.error('User location is not available');
    throw new Error('User location is not available');
  }

  logger.debug(`Using latitude: ${latitude}, longitude: ${longitude}`);

  const now = new Date();
  const start = new Date(now.setMinutes(0, 0, 0));
  const end = new Date(start.getTime() + 6 * 60 * 60 * 1000); // Add 6 hours

  const timezoneOffset = start.getTimezoneOffset() * 60000; // Correct for Vienna timezone (CET or CEST)
  const startISO = new Date(start - timezoneOffset).toISOString().slice(0, 19);
  const endISO = new Date(end - timezoneOffset).toISOString().slice(0, 19);

  logger.debug(`Fetching forecast from ${startISO} to ${endISO}`);
  
  const url = `https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nwp-v1-1h-2500m?parameters=t2m&lat_lon=${latitude}%2C${longitude}&start=${startISO}&end=${endISO}`;

  try {
    const response = await axios.get(url);
    logger.debug(`Forecast API response: ${JSON.stringify(response.data)}`);

    return convertForecast(response.data);
  } catch (error) {
    logger.error(`Error fetching forecast data: ${error.message}`);
    throw error;
  }
}

function convertOpenWeather(data) {
  return {
    timestamp: data.dt,
    timezone: data.timezone,
    longitude: data.coord.lon,
    latitude: data.coord.lat,
    weather_id: data.weather[0].id,
    weather_main: data.weather[0].main,
    weather_description: data.weather[0].description,
    weather_icon: data.weather[0].icon,
    main_temp: data.main.temp,
    main_pressure: data.main.pressure,
    main_humidity: data.main.humidity,
    main_temp_min: data.main.temp_min,
    main_temp_max: data.main.temp_max,
    wind_speed: data.wind.speed,
    wind_deg: data.wind.deg,
    wind_gust: data.wind.gust,
    clouds_all: data.clouds.all,
  };
}

function convertForecast(data) {
  const timestamps = data.timestamps;

  return timestamps.map((timestamp, index) => {
    return {
      timestamp,
      temperature: Math.round(
        data.features[0].properties.parameters.t2m.data[index]
      ),
    };
  });
}
