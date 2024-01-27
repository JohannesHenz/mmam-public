function getStopInfo() {
    const stopName = $('#stop-info-input').val();
    console.log('Sending stopName to server:', stopName); // Debugging line
    // Send a POST request to your server with the entered stopName
    $.ajax({
        type: 'POST',
        url: '/stop-info', 
        contentType: 'application/json',
        Accept: 'application/json',
        data: JSON.stringify({ stopName: stopName }),
        success: function (response) {
            displayStopInfo(response);
        },
        error: function (error) {
            // Handle errors, e.g., display an error message;
            console.error('Error fetching stop info:', error);
        }
    });
}

function removeStopInfoWindow() {
    $('#stop-info-window').remove();
}

function displayStopInfo(info) {
    // Create a new div
    removeStopInfoWindow();

    const stopInfoDiv = $('<div>').attr('id', 'stop-info-window').addClass('card shadow-lg');
    stopInfoDiv.draggable();

    if (!info || info.length === 0) {
        stopInfoDiv.append('<p>No information available</p>');
    } else {
        // Create a table
        const table = $('<table>').addClass('table table-striped');
        const tableBody = $('<tbody>');

        // Iterate through the array and append each entry as a table row
        info.forEach(stopData => {
            const lineInfo = stopData.lineInfo[0]; // Assuming there is only one entry in the lineInfo array
            const row = $('<tr>');

            // Add columns to the table row
            row.append($('<td>').text(lineInfo.name));
            row.append($('<td>').text(lineInfo.towards));
            row.append($('<td>').text(lineInfo.departureTime));

            // Add the row to the table body
            tableBody.append(row);
        });

        // Append the table body to the table
        table.append('<thead><tr><th>Linie</th><th>Richtung</th><th>Abfahrtszeit</th></tr></thead>');
        table.append(tableBody);

        // Append the table to the stopInfoDiv
        stopInfoDiv.append('<h5 class="mt-1">Stop Info</h5>');
        stopInfoDiv.append(table);
    }

    // Append the div to the body
    $('body').append(stopInfoDiv);
}


function formatStopInfo(stopData) {
    if (!stopData.monitorTitle || !stopData.lineInfo || !Array.isArray(stopData.lineInfo) || stopData.lineInfo.length === 0) {
        return 'Invalid data format';
    }

    const lineInfo = stopData.lineInfo[0]; // Assuming there is only one entry in the lineInfo array

    const formattedString = `${stopData.monitorTitle} ${lineInfo.name} towards ${lineInfo.towards}. departureTime: ${lineInfo.departureTime}`;

    return formattedString;
}


