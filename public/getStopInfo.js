function getStopInfo() {
    const stopName = $('#stop-info-input').val();
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
function displayStopInfo(info) {

    console.log('Stop Info:', info);
    alert('Stop Info:\n' + JSON.stringify(info, null, 2)); //TODO change this
}