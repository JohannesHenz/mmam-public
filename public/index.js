const { setLocation } = require('../utils/location');

var settings = {
    latitude: 0,
    longitude: 0,
    zoom: 1,
    panLock: false,
    zoomLock: false,
}
var journeys = {
    journey: []
}

var map = null;

$(document).ready(function () {
    
    getSettings().then(() => {
        
        initEventListeners();
        initMap();
        $('#map-settings, #stop-info, #stop-info-oebbm, #stop-info-settings').draggable({ containment: 'window'});
        // Request user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                settings.latitude = position.coords.latitude;
                settings.longitude = position.coords.longitude;
                map.setView([settings.latitude, settings.longitude], settings.zoom);

                setLocation(settings.latitude, settings.longitude);

            }, function(error) {
                console.log("GeoLocation Error occurred. Error code: " + error.code);

            });
        } else {
            console.log("Geolocation is not supported by this browser.");
            // Fallback to IP-based geolocation
            $.get("https://ipapi.co/json", function(response) {
                settings.latitude = response.latitude;
                settings.longitude = response.longitude;
                map.setView([settings.latitude, settings.longitude], settings.zoom);
                setLocation(settings.latitude, settings.longitude);
            }, "jsonp");
        }
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
            settings.panLock = false; 
            settings.zoomLock = false;
            console.log('done');
        },
        error: function (error) {
            console.log(error);
        }
    });
}

async function initMap() {
    //await getSettings();
    
    if (map) { // if map is already initialized
        map.remove(); // remove the existing map
    } 

    map = L.map('map').setView([settings.latitude, settings.longitude], settings.zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 100,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    map.removeControl(map.zoomControl);
    zoomLock(settings.zoomLock);
    panLock(settings.panLock);
}

function initEventListeners() {
    $(document).keydown(function (event) {

        if (!isInputFieldActive()) {
        if (event.key === 's' || event.key === 'S') {
            toggleSettings();
        } else if (event.key === 'i' || event.key === 'I') {
            toggleStopInfo();
            toggleStopInfoOebb();

        }  
        else if (event.key === 'j' || event.key === 'J') {
            toggleJourneysInfo();
        }
    }
    });
    settingsEventListeners();
    $('#stop-info-oebb-input').on('input', function() {
        getSuggestions();
    });

    $('#get-stop-info').click(function () {
        getStopInfo();
    });
    $('#get-stop-oebb-info').click(function () {
        getJourneys().then(() => {
            $('#journeysInfo').draggable({ containment: 'window'});
        });
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

function toggleStopInfoOebb() {
    $('#stop-info-oebb').toggle();
}

function toggleStopInfo() {
    $('#stop-info').toggle();
}

function toggleJourneysInfo() {
    $('#journeysInfo').toggle();
}

function isInputFieldActive() {
    // Check if any input field has focus
    return $('input:focus').length > 0;
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