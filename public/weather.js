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
  const currentTemperature = $("<span>").html(
    `${forecast[0].temperature || "N/A"}°C`
  );

  const temp1Std = $("<div>");
  temp1Std.addClass("temp-forecast");
  temp1Std.append($("<h6>").html("1 Std"));
  temp1Std.append($("<h4>").html(`${forecast[1].temperature}°C`));

  const temp3Std = $("<div>");
  temp3Std.addClass("temp-forecast");
  temp3Std.append($("<h6>").html("3 Std"));
  temp3Std.append($("<h4>").html(`${forecast[3].temperature}°C`));

  const logoImg = $("<img>")
    .attr("src", "FH_Technikum_Wien_logo.svg.png")
    .addClass("logo");
  let currentDateTime = new Date();
  let datetime =
    formatDate(currentDateTime) + "<br>" + formatTime(currentDateTime);

  const time = $("<p>").html(`${datetime}`).addClass("datetime");
  weatherDiv.append(
    weatherImg,
    currentTemperature,
    temp1Std,
    temp3Std,
    time,
    logoImg
  );
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

function epochTimeToDate(timestamp) {
  var options = {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(timestamp * 1000).toLocaleDateString("de-AT", options);
}
