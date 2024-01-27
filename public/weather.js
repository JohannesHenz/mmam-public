const AJAX_RETRY_COUNT = 3;
const AJAX_RETRY_DELAY = 0;

$(document).ready(function () {
    main();
});

function main() {
    testCall(AJAX_RETRY_COUNT);
    setTimeout(main, 1000);
}

function testCall(retries) {
    $.ajax({
       url: 'http://localhost:3313/weather',
       type: 'GET',
       dataType: 'json',
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
               updateWeatherDisplay([])
           }
       }
   });
}

function updateWeatherDisplay(data) {
    const weatherDiv = $('#weather');
    weatherDiv.empty(); // Clear display

    // Check if data is empty or falsy
    if (!data || Object.keys(data).length === 0) {
        weatherDiv.append('<p>No weather data available</p>');
        return;
    }

    const weatherImg = $('<img>').attr('src', `https://openweathermap.org/img/wn/${data.weather_icon}.png`);
    const temperature = $('<p>').text(`${data.main_temp || 'N/A'}°C`);
    const logoImg = $('<img>').attr('src', 'FH_Technikum_Wien_logo.svg.png').addClass('logo');;
    let currentDateTime = new Date();
    let datetime = currentDateTime.getFullYear() + "-"
        + String(currentDateTime.getMonth() + 1).padStart(2, '0') + "-"
        + String(currentDateTime.getDate()).padStart(2, '0') + " "
        + String(currentDateTime.getHours()).padStart(2, '0') + ":"
        + String(currentDateTime.getMinutes()).padStart(2, '0') + ":"
        + String(currentDateTime.getSeconds()).padStart(2, '0');
    const time = $('<p>').text(`${datetime}`);
    weatherDiv.append(weatherImg, temperature, logoImg, time);
}

function epochTimeToDate(timestamp) {
    var options = {weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'}
    return new Date(timestamp * 1000).toLocaleDateString("de-AT", options);
}