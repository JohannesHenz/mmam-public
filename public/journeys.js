var journeys = {
    journey: []
}

var suggestions = {
    suggestions: []
}


async function getJourneys() {
    const station = document.getElementById('stop-info-oebb-input').value || 'Wien';
    await $.ajax({
        url: '/journeys',
        type: 'GET',
        data: {
            stationName: station
        },
        success: function (response) {
            journeys = response;
            console.log(journeys);
            renderJourneysTable();
        },
        error: function (error) {
            console.log(error);
        }
    });
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
            const suggestionsList =$('#suggestions');
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

async function renderJourneysTable() {
    const station = document.getElementById('station');
    const tableBody = document.getElementById('journeysTableBody');
    tableBody.innerHTML = '';
    station.innerHTML = '';
    station.innerHTML += journeys[0].stationname;
    
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

        const row = document.createElement('tr');
      row.innerHTML = `
        <td>${journey.ti}</td>
        <td>${journey.pr}</td>
        <td>${journey.laststop}</td>
        <td>${journey.tr}</td>
      `;
      tableBody.appendChild(row);
    });
  }