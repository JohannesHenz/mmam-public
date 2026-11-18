function getStopInfo(stopName, dataType = "both") {
  $.ajax({
    url: "/stop-info",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ stopName, dataType }),
    success: function (response) {
      displayWienerLinienInfo(response);
    },
    error: function () {
      // Fall back to the GET endpoint, which searches with looser name patterns
      $.ajax({
        url: `/stop-info/wienerlinien/${encodeURIComponent(stopName)}`,
        method: "GET",
        success: function (response) {
          displayWienerLinienInfo(response);
        },
        error: function (error) {
          $("#wienerlinien-data").html("<p>Error loading departure times</p>");
        },
      });
    },
  });
}

function removeStopInfoWindow() {
  $("#stop-info-window").remove();
}

function displayStopInfo(info) {
  removeStopInfoWindow();

  const stopInfoDiv = $("<div>")
    .attr("id", "stop-info-window")
    .addClass("card shadow-lg");
  stopInfoDiv.draggable();

  if (!info || info.length === 0) {
    stopInfoDiv.append("<p>No information available</p>");
  } else {
    const table = $("<table>").addClass("table table-striped");
    const tableBody = $("<tbody>");

    info.forEach((stopData) => {
      stopData.lines.forEach((lineInfo) => {
        const row = $("<tr>");

        row.append($("<td>").text(lineInfo.name));
        row.append($("<td>").text(lineInfo.towards));
        row.append($("<td>").text(lineInfo.departureTime));

        tableBody.append(row);
      });
    });

    table.append(
      "<thead><tr><th>Linie</th><th>Richtung</th><th>Abfahrtszeit</th></tr></thead>"
    );
    table.append(tableBody);

    stopInfoDiv.append('<h5 class="mt-1">Stop Info</h5>');
    stopInfoDiv.append(table);
  }

  $("body").append(stopInfoDiv);
}

function formatStopInfo(stopData) {
  if (
    !stopData.monitorTitle ||
    !stopData.lineInfo ||
    !Array.isArray(stopData.lineInfo) ||
    stopData.lineInfo.length === 0
  ) {
    return "Invalid data format";
  }

  const lineInfo = stopData.lineInfo[0]; // Assuming there is only one entry in the lineInfo array

  const formattedString = `${stopData.monitorTitle} ${lineInfo.name} towards ${lineInfo.towards}. departureTime: ${lineInfo.departureTime}`;

  return formattedString;
}

function displayWienerLinienInfo(info) {
  const wienerlinienData = $("#wienerlinien-data");
  wienerlinienData.empty();

  if (!info || !info.data || info.data.length === 0) {
    wienerlinienData.append("<p>No departures available</p>");
    return;
  }

  const table = $("<table>").addClass("table table-striped");
  const tableBody = $("<tbody>");

  info.data.forEach((departure) => {
    const row = $("<tr>");
    row.append($("<td>").text(departure.line));
    row.append($("<td>").text(departure.direction));

    const departureTime = new Date(departure.departure);
    const formattedTime = departureTime.toLocaleTimeString("de-AT", {
      hour: "2-digit",
      minute: "2-digit",
    });

    row.append($("<td>").text(formattedTime));
    tableBody.append(row);
  });

  table.append(
    "<thead><tr><th>Linie</th><th>Richtung</th><th>Abfahrt</th></tr></thead>"
  );
  table.append(tableBody);
  wienerlinienData.append(table);
}

function isTrainLine(lineName) {
  lineName = lineName.toLowerCase();
  // Exclude U-Bahn (start with 'u'), Bus, or Tram
  if (
    lineName.startsWith("u") ||
    lineName.includes("bus") ||
    lineName.includes("tram")
  ) {
    return false;
  }
  return true;
}

function displayOebbInfo(info) {
  removeStopInfoWindow();

  const stopInfoDiv = $("<div>")
    .attr("id", "stop-info-window")
    .addClass("card shadow-lg");
  stopInfoDiv.draggable();

  if (!info || info.length === 0) {
    stopInfoDiv.append("<p>No information available</p>");
  } else {
    const table = $("<table>").addClass("table table-striped");
    const tableBody = $("<tbody>");

    info.forEach((stopData) => {
      if (stopData.lines && Array.isArray(stopData.lines)) {
        // Filter lines to only show trains
        const trainLines = stopData.lines.filter((lineInfo) =>
          isTrainLine(lineInfo.name)
        );
        trainLines.forEach((lineInfo) => {
          const row = $("<tr>");
          row.append($("<td>").text(lineInfo.name));
          row.append($("<td>").text(lineInfo.towards));
          row.append($("<td>").text(lineInfo.departureTime));
          tableBody.append(row);
        });
      }
    });

    table.append(
      "<thead><tr><th>Linie</th><th>Richtung</th><th>Abfahrtszeit</th></tr></thead>"
    );
    table.append(tableBody);

    stopInfoDiv.append('<h5 class="mt-1">Stop Info</h5>');
    stopInfoDiv.append(table);
  }

  $("body").append(stopInfoDiv);
}
