document.addEventListener('DOMContentLoaded', async function () {
    try {
        //here add the html id of the object you want the info in
        const outputElement = document.getElementById('test');
        //it gets the stopId from the URL Parameters
        const urlParams = new URLSearchParams(window.location.search);
        //defaut stopId is for Währinger Straße
        const stopId = urlParams.get('stopId') || '147';

        //url runs through proxy server because of CORS Errors
        const url = `http://localhost:8080/https://www.wienerlinien.at/ogd_realtime/monitor?stopId=${stopId}`;

        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };


        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        //asynch fetch
        const data = await response.json();

        // Extract relevant information
        const monitorInfo = data.data.monitors.map(monitor => {
            const monitorTitle = monitor.locationStop.properties.title;
            const lineInfo = monitor.lines.map(line => {
                const departureTime = new Date(line.departures.departure[0].departureTime.timeReal);
                //formatting the time to be more readable
                const formattedDepartureTime = new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: false
                }).format(departureTime);

                return {
                    name: line.name,
                    towards: line.towards,
                    departureTime: formattedDepartureTime
                };
            });

            return {
                monitorTitle,
                lineInfo
            };
        });

        // Log or display the extracted information
        console.log('Monitor Info:', monitorInfo);

        outputElement.innerHTML = '';

        // Write data in the HTML element
        monitorInfo.forEach((monitor, index) => {
            const preElement = document.createElement('pre');
            preElement.textContent = `Monitor ${index + 1}:\n${JSON.stringify(monitor, null, 2)}`;
            outputElement.appendChild(preElement);
        });
    } catch (error) {
        console.error('Error:', error);
    }
});
