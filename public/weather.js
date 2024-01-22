const AJAX_RETRY_COUNT = 3;
const AJAX_RETRY_DELAY = 0;

$(document).ready(function () {
    main();
});

function main() {
    testCall(AJAX_RETRY_COUNT);
    setTimeout(main, 2000);
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
    const timestamp = $('<p>').text(`${epochTimeToDate(data.timestamp) || 'N/A'}`);

    weatherDiv.append(weatherImg, temperature, logoImg, timestamp);
}

function epochTimeToDate(timestamp) {
    var options = {weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'}
    return new Date(timestamp * 1000).toLocaleDateString("de-AT", options);
}