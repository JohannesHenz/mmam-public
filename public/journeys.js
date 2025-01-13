var journeys = {
    journey: []
};

var suggestions = {
    suggestions: []
};

var markers = []; // Array to hold map markers

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
        success: async function (response) {
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
            dropPin(settings.latitude, settings.longitude, station, stationId);
            updateIframe(stationId, station);

            // Save updated settings
            setSettings();

            console.log(`Station ID: ${stationId}, Latitude: ${latitude}, Longitude: ${longitude}`);

            // Fetch and display nearby stations
            await getNearbyStations(); 
        },
        error: function (error) {
            console.log(error);
        }
    });
}

async function getNearbyStations() {
    await $.ajax({
        url: '/journeys/stations',
        type: 'GET',
        success: function (response) {
            console.log(response);
            const nearbyStations = calculateNearbyStations(response);
            displayNearbyStations(nearbyStations);
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function calculateNearbyStations(stations) {
    const nearbyStations = [];
    stations.forEach(station => {
        const distance = calculateDistance(settings.latitude, settings.longitude, parseFloat(station.latitude), parseFloat(station.longitude));
        if (distance <= 1) {
            nearbyStations.push(station);
        }
    });
    return nearbyStations;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Display nearby stations on the UI
function displayNearbyStations(nearbyStations) {
    // Remove all existing markers before adding new ones
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];
    
    // Drop pins for nearby stations
    nearbyStations.forEach(station => {
        console.log(station);
        dropPin(parseFloat(station.latitude), parseFloat(station.longitude), station.stationname, station.stationid);
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
    const dataTypeSelect = document.getElementById('data-type-select'); // Reference the select element
    
    if (getArrivalTimesButton && dataTypeSelect) {
        getArrivalTimesButton.addEventListener('click', () => {
            const selectedValue = dataTypeSelect.value; // Get the current value of the dropdown
            if (selectedValue === 'oebb' || selectedValue === 'both') {
                getJourneys(); // Trigger getJourneys only if the condition is met
            } else {
                console.log('getJourneys not triggered as Wiener Linien is selected');
            }
        });
    }

    // Set the iframe to the default station's evaId on page load
    updateIframe(defaultStationId, defaultStationName);
});

function dropPin(latitude, longitude, stationName, stationId) {

    // Create a new marker at the specified coordinates
    const newMarker = L.marker([latitude, longitude]).addTo(map);
    markers.push(newMarker);

    // Bind a tooltip to the marker to act as an annotation
    newMarker.bindTooltip(`Station: ${stationName}`, {
        permanent: true, // Makes the tooltip only visible on hover
        direction: 'top', // Position the annotation above the pin
        offset: L.point(0, -10), // Adjust the offset if needed to improve visibility
    });

    // Add click event listener to update iframe when pin is clicked
    newMarker.on('click', function() {
        updateIframe(stationId, stationName);
    });
}
