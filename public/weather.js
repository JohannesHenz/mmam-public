const AJAX_RETRY_COUNT = 3;
const AJAX_RETRY_DELAY = 0;

const RETRY_DELAY_SECONDS = 600;

$(document).ready(function () {
  main();
});

function main() {
  testCall(AJAX_RETRY_COUNT);
  setTimeout(main, RETRY_DELAY_SECONDS * 1000);
}

function testCall(retries) {
  $.ajax({
    url: "http://localhost:3313/weather",
    type: "GET",
    dataType: "json",
    success: function (data, status, xhr) {
      console.log(data);
      updateWeatherDisplay(data);
    },
    error: function (xhr, status, error) {
      if (retries > 1) {
        setTimeout(function () {
          testCall(retries - 1);
        }, AJAX_RETRY_DELAY);
      } else {
        console.log(`failed to GET ${this.url} in ${AJAX_RETRY_COUNT} tries`);
        updateWeatherDisplay([]);
      }
    },
  });
}

function updateWeatherDisplay(data) {
  const weatherDiv = $("#weather");
  weatherDiv.empty(); // Clear display

  // Check if data is empty or falsy
  if (!data || Object.keys(data).length === 0) {
    weatherDiv.append("<p>No weather data available</p>");
    return;
  }

  const forecast = data.forecast;

  const weatherImg = $("<img>").attr(
    "src",
    `https://openweathermap.org/img/wn/${data.weather_icon}.png`
  );
  const temperature = $("<p>").html(
    `${forecast[0].temperature || "N/A"}°C
    <br>In 1 Std.: ${forecast[1].temperature}°C
    <br>In 3 Std.: ${forecast[3].temperature}°C `
  );
  const logoImg = $("<img>")
    .attr("src", "FH_Technikum_Wien_logo.svg.png")
    .addClass("logo");
  let currentDateTime = new Date();
  let datetime =
    currentDateTime.getFullYear() +
    "-" +
    String(currentDateTime.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(currentDateTime.getDate()).padStart(2, "0") +
    "<br>" +
    String(currentDateTime.getHours()).padStart(2, "0") +
    ":" +
    String(currentDateTime.getMinutes()).padStart(2, "0") +
    ":" +
    String(currentDateTime.getSeconds()).padStart(2, "0");
  const time = $("<p>").html(`${datetime}`);
  weatherDiv.append(weatherImg, temperature, time, logoImg);
}

function epochTimeToDate(timestamp) {
  var options = {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(timestamp * 1000).toLocaleDateString("de-AT", options);
}
const database = require("../database");
const router = require("express-promise-router")();
const axios = require("axios");
const logger = require("../utils/logger");

router.get("/", async (request, response) => {
  /*
    let data = await database.query('SELECT * from weather ORDER BY id');
    if (data.rows.length === 0) {
        console.log('fetching data from openweather');
        response.json(await fetchOpenWeather());
    }
    */
  response.json(await fetchWeather());
});

module.exports = router;

async function fetchWeather() {
  const openWeather = await fetchOpenWeather();
  const forecast = await fetchForecast();
  return { ...openWeather, forecast: forecast };
}
async function fetchOpenWeather() {
  logger.debug("fetchOpenWeather()");
  const apiKey = "1af530a8a7429bd4fb34d410aca8f0b0"; // TODO: dotenv
  const longitude = 16.377324101340463;
  const latitude = 48.23931877070726;
  const units = "metric";
  const lang = "en";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&lang=${lang}&appid=${apiKey}`;

  try {
    const response = await axios.get(url);

    database.query(
      "INSERT INTO weather (timestamp, timezone, longitude, latitude, weather_id, weather_main, weather_description, weather_icon, main_temp, main_pressure, main_humidity, main_temp_min, main_temp_max, wind_speed, wind_deg, wind_gust, clouds_all) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 , $11, $12, $13, $14, $15, $16, $17)",
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
    logger.error(error.message);
  }
  return null;
}

async function fetchForecast() {
  logger.debug("fetchForecast()");
  const longitude = 16.377324101340463;
  const latitude = 48.23931877070726;

  const now = new Date();
  const start = new Date(now.setMinutes(0, 0, 0));
  const end = new Date(start.getTime() + 6 * 60 * 60 * 1000); // Add 6 hours

  const timezoneOffset = start.getTimezoneOffset() * 60000; // Correct for Vienna timezone (CET or CEST)
  const startISO = new Date(start - timezoneOffset).toISOString().slice(0, 19);
  const endISO = new Date(end - timezoneOffset).toISOString().slice(0, 19);

  logger.error(startISO);
  const url = `https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nwp-v1-1h-2500m?parameters=t2m&lat_lon=${latitude}%2C${longitude}&start=${startISO}&end=${endISO}`;

  try {
    const response = await axios.get(url);

    return convertForecast(response.data);
  } catch (error) {
    logger.error(error.message);
  }

  return null;
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
      temperature: data.features[0].properties.parameters.t2m.data[index],
    };
  });
}