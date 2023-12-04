const database = require('../database');
const router = require('express-promise-router')();
const axios = require('axios');
const logger = require('../utils/logger');

router.get('/', async (request, response) => {
    /* vani quickfix
    let data = await database.query('SELECT * from weather ORDER BY id');
    // TODO: check if data is older than N minutes
    if (data.rows.length === 0) {
        response.json(await fetchOpenWeather());
    }
    */
    const data = {
        "timestamp": 1701732014,
        "timezone": 3600,
        "longitude": 16.3773,
        "latitude": 48.2393,
        "weather_id": 804,
        "weather_main": "Clouds",
        "weather_description": "overcast clouds",
        "weather_icon": "04n",
        "main_temp": -0.95,
        "main_pressure": 1013,
        "main_humidity": 86,
        "main_temp_min": -3.21,
        "main_temp_max": 0.84,
        "wind_speed": 4.47,
        "wind_deg": 144,
        "wind_gust": 7.6,
        "clouds_all": 100
    }
    response.json(data);
});

module.exports = router

async function fetchOpenWeather() {
    logger.debug('fetchOpenWeather()');
    const apiKey = '1af530a8a7429bd4fb34d410aca8f0b0'; // TODO: dotenv
    const longitude = 16.377324101340463;
    const latitude = 48.23931877070726;
    const units = 'metric';
    const lang = 'en';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&lang=${lang}&appid=${apiKey}`;
    return await axios.get(url).then((response) => {
        // TODO: save to database
        return convertData(response.data);
    }).catch((error) => {
        logger.error(error.message);
        return null;
    });
}

function convertData(data) {
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
        clouds_all: data.clouds.all
    };
}