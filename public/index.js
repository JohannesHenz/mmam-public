var settings = {
  latitude: 0,
  longitude: 0,
  zoom: 1,
  panLock: false,
  zoomLock: false,
};
var journeys = {
  journey: [],
};

var map = null;

$(document).ready(function () {
  getSettings().then(() => {
    initEventListeners();
    initMap();
    $(
      "#settings, #stop-info, #stop-info-oebb, #stop-info-settings, #journeysInfo, #wienerlinieninfo, #disruptions"
    ).draggable({ containment: "window" });
    if (settings.latitude && settings.longitude) {
      setLocation(settings.latitude, settings.longitude);
    }
    // Request user's location
    else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          settings.latitude = position.coords.latitude;
          settings.longitude = position.coords.longitude;
          map.setView([settings.latitude, settings.longitude], settings.zoom);

          // Send user location to the server
          setLocation(settings.latitude, settings.longitude);
        },
        function (error) {
          console.log("GeoLocation Error occurred. Error code: " + error.code);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      // Fallback to IP-based geolocation
      $.get(
        "https://ipapi.co/json",
        function (response) {
          settings.latitude = response.latitude;
          settings.longitude = response.longitude;
          map.setView([settings.latitude, settings.longitude], settings.zoom);

          // Send user location to the server
          setLocation(settings.latitude, settings.longitude);
        },
        "jsonp"
      );
    }
  });
});

function setLocation(latitude, longitude) {
  // Send the coordinates to the server
  $.ajax({
    type: "POST",
    url: "/location/set",
    contentType: "application/json",
    data: JSON.stringify({
      latitude: latitude,
      longitude: longitude,
    }),
    success: function (response) {
      console.log("Location set successfully:", response);
    },
    error: function (error) {
      console.error("Error setting location:", error);
    },
  });

  // Center the map on the specified location
  map.setView([latitude, longitude], settings.zoom);
}

async function getSettings() {
  await $.ajax({
    url: "/settings",
    type: "GET",
    success: function (response) {
      settings.latitude = response.latitude;
      settings.longitude = response.longitude;
      settings.zoom = response.zoom;
      settings.panLock = false;
      settings.zoomLock = false;
      console.log("done");
    },
    error: function (error) {
      console.log(error);
    },
  });
}

async function initMap() {
  if (map) {
    // if map is already initialized
    map.remove(); // remove the existing map
  }

  map = L.map("map").setView(
    [settings.latitude, settings.longitude],
    settings.zoom
  );
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 100,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  map.removeControl(map.zoomControl);
  zoomLock(settings.zoomLock);
  panLock(settings.panLock);
}

function initEventListeners() {
  $("#close-stop-info-oebb").click(function () {
    $("#stop-info-oebb").hide(); // Hide the Stop Info ÖBB section
  });

  $(".navbar-nav a").click(function () {
    $("#collapseMenu").collapse("hide"); // Close the menu
  });

  $("#close-settings").click(function () {
    $("#settings").hide(); // Hide the settings section
  });
  // Add event listeners for burger menu items
  $("#menu-map-settings").click(function () {
    toggleSettings(); // Show/hide map settings
  });

  $("#menu-stop-info-oebb").click(function () {
    toggleStopInfoOebb(); // Show/hide stop info ÖBB
  });

  $("#menu-stop-info").click(function () {
    toggleJourneysInfo(); // Show/hide stop info
  });

  $("#menu-wienerlinien-journeys").click(function () {
    toggleWienerLinienJourneys();
  });

  settingsEventListeners(); // Keep other event listeners for settings
}

$(document).ready(function () {
  $("#menu-disruptions").click(toggleDisruptions);
});

function updateSettings() {
  $("#latitude").val(map.getCenter().lat);
  $("#longitude").val(map.getCenter().lng);
  $("#zoom").val(map.getZoom());
  if (settings.panLock) {
    $("#pan-lock").prop("checked", true);
  } else {
    $("#pan-lock").prop("checked", false);
  }
  if (settings.zoomLock) {
    $("#zoom-lock").prop("checked", true);
  } else {
    $("#zoom-lock").prop("checked", false);
  }
}

function toggleSettings() {
  $("#settings").toggle();
  updateSettings();
}

function toggleStopInfoOebb() {
  $("#stop-info-oebb").toggle();
}

function toggleJourneysInfo() {
  $("#journeysInfo").toggle();
}

// Add this after the existing toggle functions
function toggleDisruptions() {
  $("#disruptions").toggle();
}

function toggleWienerLinienJourneys() {
  $("#wienerlinienInfo").toggle();
}

$(document).ready(function () {
  const wienerlinienWindow = $("#wienerlinienInfo");
  wienerlinienWindow.draggable({
    handle: ".card-header",
  });

  const toggleWienerlinienButton = $("#toggle-wienerlinien-window");
  toggleWienerlinienButton.click(function () {
    wienerlinienWindow.toggle();
  });
});

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
  $("#map-settings-reset").click(function () {
    map.setView([settings.latitude, settings.longitude], settings.zoom);
    zoomLock(settings.zoomLock);
    panLock(settings.panLock);
    getSettings();
  });
  $("#map-settings-detect").click(function () {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        settings.latitude = position.coords.latitude;
        settings.longitude = position.coords.longitude;
        map.setView([settings.latitude, settings.longitude], settings.zoom);

        // Send user location to the server
        setLocation(settings.latitude, settings.longitude);
      },
      function (error) {
        console.log("GeoLocation Error occurred. Error code: " + error.code);
      }
    );
  });
  $("#map-settings-save").click(function () {
    settings.latitude = map.getCenter().lat;
    settings.longitude = map.getCenter().lng;
    settings.zoom = map.getZoom();
    settings.panLock = $("#pan-lock").is(":checked");
    settings.zoomLock = $("#zoom-lock").is(":checked");
    setSettings();
  });
  $("#map").mousemove(function () {
    updateSettings();
  });
  $("#latitude").change(function () {
    map.panTo([$("#latitude").val(), map.getCenter().lng]);
  });
  $("#longitude").change(function () {
    map.panTo([map.getCenter().lat, $("#longitude").val()]);
  });
  $("#zoom").change(function () {
    map.setZoom($("#zoom").val());
  });
  $("#pan-lock").change(function () {
    if ($("#pan-lock").is(":checked")) {
      settings.panLock = true;
      panLock(settings.panLock);
    } else {
      settings.panLock = false;
      panLock(settings.panLock);
    }
  });
  $("#zoom-lock").change(function () {
    if ($("#zoom-lock").is(":checked")) {
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
    url: "/settings",
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    success: function (response) {
      console.log(response);
    },
    error: function (error) {
      console.log(error);
    },
  });
}



$(document).ready(function () {
  $("#wienerlinienInfo").draggable({
    handle: ".card-header",
    containment: "window",
  });
});

$(document).ready(function () {
  $("#close-wienerlinien").click(function () {
    $("#wienerlinienInfo").hide();
  });
});

$(document).ready(function () {
  // Show windows by default
  $("#wienerlinienInfo").show();
  $("#stop-info-oebb").show();

  // Handle Get Arrival Times button click
  $("#get-arrival-times-button").click(async function (e) {
    e.preventDefault();
    const stopName = $("#stop-info-oebb-input").val();
    const dataType = $("#data-type-select").val();

    //console.log("Get Arrival Times clicked for:", { stopName, dataType });

    if (!stopName) {
      console.error("No stop name provided");
      $("#wienerlinien-data").html("<p>Please enter a stop name</p>");
      return;
    }

    try {
      // First get the connected lines to find the Wiener Linien stop ID
      const connectedLines = await getConnectedLines(stopName);
      //console.log("Connected lines response:", connectedLines);

      if (dataType === "wienerlinien" || dataType === "both") {
        // Get Wiener Linien departures
        //console.log(
        //  "(Index.js)Getting Wiener Linien departures for:",
        //  stopName
        //);
        const response = await $.ajax({
          url: `/stop-info/wienerlinien/${encodeURIComponent(stopName)}`,
          method: "GET",
        });

        //console.log("Wiener Linien response:", response);
        displayWienerLinienInfo(response);
      }
    } catch (error) {
      console.error("Error getting arrival times:", error);
      $("#wienerlinien-data").html("<p>Error loading departure times</p>");
    }
  });

  // Window close handlers
  $("#close-wienerlinien").click(function () {
    $("#wienerlinienInfo").hide();
  });

  $("#close-stop-info-oebb").click(function () {
    $("#stop-info-oebb").hide();
  });
});
