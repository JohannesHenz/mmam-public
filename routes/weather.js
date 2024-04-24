const database = require('../database');
const router = require('express-promise-router')();
const axios = require('axios');
const logger = require('../utils/logger');

router.get('/', async (request, response) => {
    /*
    let data = await database.query('SELECT * from weather ORDER BY id');
    if (data.rows.length === 0) {
        console.log('fetching data from openweather');
        response.json(await fetchOpenWeather());
    }
    */
    response.json(await fetchOpenWeather());
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
        database.query(`
            INSERT INTO weather (timestamp, timezone, longitude, latitude, weather_id, weather_main, weather_description, weather_icon, main_temp, main_pressure, main_humidity, main_temp_min, main_temp_max, wind_speed, wind_deg, wind_gust, clouds_all) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 , $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (timestamp, longitude, latitude) 
            DO UPDATE SET weather_id = EXCLUDED.weather_id, weather_main = EXCLUDED.weather_main, weather_description = EXCLUDED.weather_description, weather_icon = EXCLUDED.weather_icon, main_temp = EXCLUDED.main_temp, main_pressure = EXCLUDED.main_pressure, main_humidity = EXCLUDED.main_humidity, main_temp_min = EXCLUDED.main_temp_min, main_temp_max = EXCLUDED.main_temp_max, wind_speed = EXCLUDED.wind_speed, wind_deg = EXCLUDED.wind_deg, wind_gust = EXCLUDED.wind_gust, clouds_all = EXCLUDED.clouds_all
        `, [
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
            response.data.clouds.all
        ]);
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