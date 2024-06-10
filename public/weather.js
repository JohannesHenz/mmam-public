const AJAX_RETRY_COUNT = 3;
const AJAX_RETRY_DELAY = 0;

const RETRY_DELAY_SECONDS = 600;

$(document).ready(function () {
  main();
});

let currentWeatherUpdate;

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

  const forecast = data;

  const weatherImg = $("<img>").attr("src", getSymbolUrl(forecast[0]));
  const currentTemperature = $("<span>").html(
    `${forecast[0].temperature || "N/A"}°C`
  );

  const forecastDiv = $("<div>").addClass("temp-forecast");

  const logoImg = $("<img>")
    .attr("src", "FH_Technikum_Wien_logo.svg.png")
    .addClass("logo");
  let currentDateTime = new Date();
  let datetime =
    formatDate(currentDateTime) + "<br>" + formatTime(currentDateTime);

  const time = $("<p>").html(`${datetime}`).addClass("datetime");
  weatherDiv.append(weatherImg, currentTemperature, forecastDiv, time, logoImg);
  displayForecast(data, 1); // Start with the first hour forecast
}

function displayForecast(forecastData, index) {
  const forecastDiv = $(".temp-forecast");
  forecastDiv.empty(); // Clear previous forecast

  if (index >= forecastData.length) {
    index = 1; // Reset index if it exceeds available data
  }
  // Calculate the hour label dynamically
  forecastDiv.append($("<h6>").html(`${index} Std`));
  forecastDiv.append($("<h4>").html(`${forecastData[index].temperature}°C`));

  //Reset the timer in case it exists already from a previous weather call
  if (currentWeatherUpdate) {
    clearTimeout(currentWeatherUpdate);
  }

  // Set to update to next forecast after 2 seconds
  currentWeatherUpdate = setTimeout(
    () => displayForecast(forecastData, index + 1),
    2000
  );
}

function getSymbolUrl(forecastData) {
  const timestamp = forecastData.timestamp;
  const symbol = forecastData.symbol;

  // Parse the timestamp to a Date object
  const date = new Date(timestamp);

  // Get the hour of the day from the Date object
  const hour = date.getUTCHours();

  // Determine the prefix based on the time
  const isNight = hour >= 18 || hour < 6;
  let prefix = isNight ? "nsymb" : "symb";

  // If the symbol is a single digit, prepend a '0' to the symbol
  const symbolString = symbol < 10 ? `0${symbol}` : `${symbol}`;

  // Concatenate the prefix and the symbol string
  const imageName = prefix + symbolString;
  const urlPath = isNight ? "www_mond" : "www_sonne";

  return `https://www.zamg.ac.at/zamgWeb/common/img/${urlPath}/${imageName}.png`;
}

function formatDate(date) {
  return (
    String(date.getDate()).padStart(2, "0") +
    "." +
    String(date.getMonth() + 1).padStart(2, "0") +
    "." +
    date.getFullYear()
  );
}

function formatTime(date) {
  return (
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0")
  );
}
