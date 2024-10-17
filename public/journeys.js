var journeys = {
    journey: []
}

var suggestions = {
    suggestions: []
}

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
};

async function getJourneys() {
    const stationInput = document.getElementById('stop-info-oebb-input');
    const station = stationInput.value || 'Wien'; // Get the station name

    await $.ajax({
        url: '/journeys',
        type: 'GET',
        data: {
            stationName: station
        },
        success: function (response) {
            // Extract station details and journeys
            const stationDetails = response.station;
            const journeys = response.journeys;
            console.log(journeys);

            if (stationDetails) {
                const latitude = stationDetails.latitude;
                const longitude = stationDetails.longitude;

                if (latitude && longitude) {
                    // Convert to float before using
                    const latitudeFloat = parseFloat(insertDotAfterFirstTwoDigits(latitude));
                    const longitudeFloat = parseFloat(insertDotAfterFirstTwoDigits(longitude));

                    setLocation(latitudeFloat, longitudeFloat);

                    // Drop a pin with the station name
                    dropPin(latitudeFloat, longitudeFloat, station); // Pass station name here
                }
            }

            // Render the journeys table
            renderJourneysTable(journeys);
        },
        error: function (error) {
            console.log(error);
        }
    });
}

// Helper function to insert a dot after the first two digits
function insertDotAfterFirstTwoDigits(coordinate) {
    const coordinateStr = coordinate.toString();

    // Insert dot after the first two digits
    if (coordinateStr.length > 2) {
        return coordinateStr.slice(0, 2) + '.' + coordinateStr.slice(2);
    }

    return coordinateStr; // Return unchanged if too short
}

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
                const option = $('<option>').val(suggestion.value);
                suggestionsList.append(option);
            });
        },
        error: function (error) {
            console.log(error);
        }
    });
}

// Debounce getSuggestions with a delay of 300ms
const debouncedGetSuggestions = debounce(getSuggestions, 300);

document.addEventListener('DOMContentLoaded', function() {
    // Use the debounced function instead of the original one
    const stopInfoInput = document.getElementById('stop-info-oebb-input');
    if(stopInfoInput) {
        stopInfoInput.addEventListener('input', debouncedGetSuggestions);
    }

    // Add event listener to 'Get Arrival Times' button
    const getArrivalTimesButton = document.getElementById('get-arrival-times-button');
    if(getArrivalTimesButton) {
        getArrivalTimesButton.addEventListener('click', getJourneys);
    }
});

async function renderJourneysTable(journeys) {
    const station = document.getElementById('station');
    const tableBody = document.getElementById('journeysTableBody');

    // Clear the table before rendering
    tableBody.innerHTML = '';
    station.innerHTML = '';

    // Check if journeys are empty
    if (!journeys || journeys.length === 0) {
        console.error('No journeys available');
        station.innerHTML = 'No journeys available';
        return;
    }

    // Set station name
    station.innerHTML = journeys[0].stationname;

    journeys.forEach(journey => {
        // Get the current date and time
        const currentTime = new Date();

        // Create a journeyTime Date object with the same date as currentTime
        const journeyTime = new Date(currentTime);
        const [hours, minutes] = journey.ti.split(':');
        journeyTime.setHours(hours, minutes);

        // If the journey time is earlier than the current time, skip this iteration
        if (journeyTime < currentTime) {
            return;
        }

        // Handle the 'rt' field (real-time info) by parsing it as a string
        let rtDisplay = ' ';
        if (typeof journey.rt === 'string' && journey.rt !== 'false') {
            // Check if the status is "Ausfall"
            const statusMatch = journey.rt.match(/"status":"Ausfall"/);
            if (statusMatch) {
                rtDisplay = 'Ausfall';
            } else {
                // Use a regex to find the "dlt" value in the rt string if status is not "Ausfall"
                const dltMatch = journey.rt.match(/"dlt":"([^"]+)"/);
                if (dltMatch) {
                    rtDisplay = dltMatch[1]; // Extract the time from the match
                }
            }
        }

        // Create table row
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${journey.ti}</td>
          <td>${rtDisplay}</td>
          <td>${journey.pr}</td>
          <td>${journey.laststop}</td>
          <td>${journey.tr}</td>
        `;
        tableBody.appendChild(row);
    });
}

