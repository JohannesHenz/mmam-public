
var journeys = {
    journey: []
};

var suggestions = {
    suggestions: []
};

// Default station evaId and name (adjust the values as needed)
const defaultStationId = 1392068;  // Replace with your desired default station's evaId
const defaultStationName = "Wien Höchstädtplatz";  // Replace with your desired default station's name

// Debounce function to limit how often API requests are made
function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Fetch station suggestions based on user input
async function getSuggestions() {
    const station = document.getElementById('stop-info-oebb-input').value || 'Wien';
    await $.ajax({
        url: '/journeys/suggestions',
        type: 'GET',
        data: {
            stationName: station
        },
        success: function (response) {
            suggestions = response;
            console.log(suggestions);
            const suggestionsList = $('#suggestions');
            suggestionsList.empty();
            suggestions.suggestions.forEach(suggestion => {
                const option = $('<option>')
                    .val(suggestion.value)
                    .attr('data-lat', suggestion.ycoord)
                    .attr('data-lon', suggestion.xcoord);  // Store latitude and longitude
                suggestionsList.append(option);
            });
        },
        error: function (error) {
            console.log(error);
        }
    });
}

async function getJourneys() {
    const stationInput = document.getElementById('stop-info-oebb-input');
    const station = stationInput.value || 'Wien'; // Get the station name

    // Fetch the station data (ID, latitude, longitude) from the backend
    await $.ajax({
        url: '/journeys', // The backend route
        type: 'GET',
        data: {
            stationName: station
        },
        success: function (response) {
            console.log(response);
            const stationId = response.stationid;
            const latitude = parseFloat(response.latitude);  // Latitude from the database
            const longitude = parseFloat(response.longitude);  // Longitude from the database

            // Update settings with the new location data
            settings.latitude = latitude;
            settings.longitude = longitude;
            settings.zoom = 15;  // Adjust zoom level as needed

            // Set the map location and update the iframe
            setLocation(settings.latitude, settings.longitude);
            dropPin(settings.latitude, settings.longitude, station);
            updateIframe(stationId, station);;

            // Save updated settings
            setSettings();

            console.log(`Station ID: ${stationId}, Latitude: ${latitude}, Longitude: ${longitude}`);
        },
        error: function (error) {
            console.log(error);
        }
    });
}

// Update the iframe with the new station's evaId
function updateIframe(stationId, stationName) {
    const iframe = document.getElementById('oebbIframe');
    const newSrc = `https://fahrplan.oebb.at/bin/stboard.exe/dn?L=vs_liveticker&evaId=${stationId}&boardType=dep&productsFilter=1011111111011&dirInput=&tickerID=dep&start=yes&eqstops=true&showJourneys=12&additionalTime=0`;
    
    // Update iframe source with new station's evaId
    iframe.src = newSrc;
    
    // Update station name in the UI
    const stationNameElement = document.getElementById('station');
    stationNameElement.textContent = `Station: ${stationName}`;
}

// Debounced function for fetching station suggestions
const debouncedGetSuggestions = debounce(getSuggestions, 300);

// Set default station in the iframe on page load
document.addEventListener('DOMContentLoaded', function() {
    const stopInfoInput = document.getElementById('stop-info-oebb-input');
    if (stopInfoInput) {
        stopInfoInput.addEventListener('input', debouncedGetSuggestions);
    }

    const getArrivalTimesButton = document.getElementById('get-arrival-times-button');
    if (getArrivalTimesButton) {
        getArrivalTimesButton.addEventListener('click', getJourneys);
    }

    // Set the iframe to the default station's evaId on page load
    updateIframe(defaultStationId, defaultStationName);
});
