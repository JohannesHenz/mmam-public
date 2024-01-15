var settings = {
    latitude: 0,
    longitude: 0,
    zoom: 1,
    panLock: false,
    zoomLock: false,
}

var map = null;

$(document).ready(function () {
    getSettings().then(() => {
        initEventListeners();
        initMap();
        $('#map-settings, #stop-info').draggable({ containment: 'window'});
    })
});

async function getSettings() {
    await $.ajax({
        url: '/settings',
        type: 'GET',
        success: function (response) {
            settings.latitude = response.latitude;
            settings.longitude = response.longitude;
            settings.zoom = response.zoom;
            settings.panLock = true;
            settings.zoomLock = true;
            console.log('done');
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function initMap() {
    map = L.map('map').setView([settings.latitude, settings.longitude], settings.zoom);
    zoomLock(settings.zoomLock);
    panLock(settings.panLock);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 100,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    map.removeControl(map.zoomControl);
}

function initEventListeners() {
    $(document).keydown(function (event) {

        if (!isInputFieldActive()) {
        if (event.key === 's' || event.key === 'S') {
            toggleSettings();
        } else if (event.key === 'i' || event.key === 'I') {
            toggleStopInfo();
        }  
    }
    });
    settingsEventListeners();

    $('#get-stop-info').click(function () {
        getStopInfo();
    });
}

function updateSettings() {
    $('#latitude').val(map.getCenter().lat);
    $('#longitude').val(map.getCenter().lng);
    $('#zoom').val(map.getZoom());
    if (settings.panLock) {
        $('#pan-lock').prop('checked', true);
    } else {
        $('#pan-lock').prop('checked', false);
    }
    if (settings.zoomLock) {
        $('#zoom-lock').prop('checked', true);
    } else {
        $('#zoom-lock').prop('checked', false);
    }
}

function toggleSettings() {
    // $('#map').toggle();
    $('#settings').toggle();
    updateSettings();
}

function toggleStopInfo() {
    $('#stop-info').toggle();
}

function isInputFieldActive() {
    // Check if any input field has focus
    return $('input:focus').length > 0;
}


function getStopInfo() {
    const stopName = $('#stop-info-input').val(); 
    // Send a POST request to your server with the entered stopName
    $.ajax({
        type: 'POST',
        url: '/stop-info', // This should match your server route
        contentType: 'application/json',
        Accept: 'application/json',
        data: JSON.stringify({ stopName: stopName }),
        success: function(response) {
            // Handle the successful response, e.g., display the data in a new window
            displayStopInfo(response);
        },
        error: function(error) {
            // Handle errors, e.g., display an error message;
            console.error('Error fetching stop info:', error);
        }
    });
}

function displayStopInfo(info) {

    console.log('Stop Info:', info);
    alert('Stop Info:\n' + JSON.stringify(info, null, 2)); //TODO change this
}



function zoomLock(state) {
    if (state) {
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
    } else {
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
    }
}

function panLock(state) {
    if (state) {
        map.dragging.disable();
    } else {
        map.dragging.enable();
    }
}

function settingsEventListeners() {
    $('#map-settings-reset').click(function () {
        map.setView([settings.latitude, settings.longitude], settings.zoom);
        zoomLock(settings.zoomLock);
        panLock(settings.panLock);
        getSettings();
    });
    $('#map-settings-save').click(function () {
        settings.latitude = map.getCenter().lat;
        settings.longitude = map.getCenter().lng;
        settings.zoom = map.getZoom();
        settings.panLock = $('#pan-lock').is(':checked');
        settings.zoomLock = $('#zoom-lock').is(':checked');
        setSettings();
    });
    $('#map').mousemove(function () {
        updateSettings();
    });
    $('#latitude').change(function () {
        map.panTo([$('#latitude').val(), map.getCenter().lng]);
    });
    $('#longitude').change(function () {
        map.panTo([map.getCenter().lat, $('#longitude').val()]);
    });
    $('#zoom').change(function () {
        map.setZoom($('#zoom').val());
    });
    $('#pan-lock').change(function () {
        if ($('#pan-lock').is(':checked')) {
            settings.panLock = true;
            panLock(settings.panLock);
        } else {
            settings.panLock = false;
            panLock(settings.panLock);
        }
    });
    $('#zoom-lock').change(function () {
        if ($('#zoom-lock').is(':checked')) {
            settings.zoomLock = true;
            zoomLock(settings.zoomLock);
        } else {
            settings.zoomLock = false;
            zoomLock(settings.zoomLock);
        }
    });
}

function setSettings() {
    let data = {
        latitude: settings.latitude,
        longitude: settings.longitude,
        zoom: settings.zoom,
    };
    $.ajax({
        url: '/settings',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (response) {
            console.log(response);
        },
        error: function (error) {
            console.log(error);
        }
    });
}