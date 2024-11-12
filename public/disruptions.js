$(document).ready(function () {
  // Hide disruptions card initially
  $("#disruptions").hide();

  // Make the disruptions window draggable
  $("#disruptions").draggable({
    handle: ".card-header", // Make only the header draggable
  });

  // Toggle disruptions visibility
  $("#show-disruptions").change(function () {
    $(".regular-disruption").toggle($(this).is(":checked"));
  });

  // Toggle elevator disruptions visibility
  $("#show-elevator").change(function () {
    $(".elevator-disruption").toggle($(this).is(":checked"));
  });

  // Close button handler
  $("#close-disruptions").click(function () {
    $("#disruptions").hide();
  });

  // Filter handlers
  $("#line-filter").change(filterDisruptions);
  $("#station-filter").change(filterDisruptions);

  // Fetch and display disruptions
  fetchDisruptions();

 // Event listener for changes in the station name
 $("#station").on("DOMSubtreeModified", function () {
    const stationName = $(this).text().replace("Station: ", "").trim();
    if (stationName) {
      fetchDisruptionsForStation(stationName);
    }
  });
});

async function fetchDisruptionsForStation(stationName) {
    try {
      const response = await fetch(`/disruptions?station=${encodeURIComponent(stationName)}`);
      const disruptions = await response.json();
      updateDisruptionsList(disruptions);
    } catch (error) {
      console.error("Error fetching disruptions:", error);
    }
  }

function filterDisruptions() {
  const selectedLines = $("#line-filter").val() || [];
  const selectedStations = $("#station-filter").val() || [];
  const selectedStop = $("#stop-info-oebb-input").val(); // Capture selected stop

  $(".disruption-item").each(function () {
    const lines = $(this).data("lines") || [];
    const stations = $(this).data("stations") || [];

    const showByLine =
      selectedLines.length === 0 ||
      lines.some((line) => selectedLines.includes(line));
    const showByStation =
      selectedStations.length === 0 ||
      stations.some((station) => selectedStations.includes(station));
    const showByStop = !selectedStop || stations.includes(selectedStop); // Check if disruption is related to the selected stop

    $(this).toggle(showByLine && showByStation && showByStop);
  });
}
async function fetchDisruptions() {
  try {
    const response = await fetch("/disruptions");
    const disruptions = await response.json();
    updateDisruptionsList(disruptions);
  } catch (error) {
    console.error("Error fetching disruptions:", error);
  }
}

async function updateDisruptionsList(disruptions) {
  console.log("stop-info-oebb-input", $("#stop-info-oebb-input").val());
  const currentStation = $("#stop-info-oebb-input").val();
  const connectedLines = (await getConnectedLines(currentStation)) || [];
  // Filter disruptions based on current station and its connected lines
  const relevantDisruptions = disruptions.filter((disruption) => {
    // Ensure relatedLines and relatedStops are arrays
    const lines = Array.isArray(disruption.relatedLines)
      ? disruption.relatedLines
      : [];
    const stops = Array.isArray(disruption.relatedStops)
      ? disruption.relatedStops
      : [];

    const isRelatedToStation = stops.some(
      (stop) =>
        typeof stop === "string" &&
        currentStation &&
        (stop.includes(currentStation) || currentStation.includes(stop))
    );

    const isRelatedToConnectedLines = lines.some((line) =>
      connectedLines.includes(line)
    );

    return isRelatedToStation || isRelatedToConnectedLines;
  });

  const list = $("#disruptions-list");
  list.empty();

  if (relevantDisruptions.length === 0) {
    list.append(
      $("<div>")
        .addClass("list-group-item")
        .text("Keine Störungen für diese Station")
    );
    return;
  }

  relevantDisruptions.forEach((disruption) => {
    const item = $("<div>")
      .addClass("list-group-item disruption-item")
      .addClass(
        disruption.elevator ? "elevator-disruption" : "regular-disruption"
      ).html(`
                <strong>${disruption.title}</strong><br>
                <small class="text-muted">Linien: ${
                  disruption.relatedLines?.join(", ") || "Keine"
                }</small><br>
                <em>${disruption.description}</em>
            `);
    list.append(item);
  });
}

async function getConnectedLines(stationName) {
  if (!stationName) {
    console.error("getConnectedLines: stationName is required");
    return [];
  }

  try {
    console.log("1. Fetching connected lines for station:", stationName);
    const encodedURIComponent = encodeURIComponent(stationName);
    console.log("1b. Encoded station name:", encodedURIComponent);
    const url = 'https://localhost:3313/stop-info/connected-lines/' + encodedURIComponent;
    console.log("2. Request URL:", url);

    const response = await fetch(url);
    console.log("3. Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fetch error:", response.status, errorText);
      throw new Error("Failed to fetch connected lines");
    }

    const lines = await response.json();
    console.log("4b. Received lines:", lines);
    return lines;
  } catch (error) {
    console.error("Error in getConnectedLines:", error);
    return [];
  }
}

// Update the event listener for station changes
$(document).ready(function () {
  $("#stop-info-oebb-input").on("change", function () {
    fetchDisruptions();
  });
});
