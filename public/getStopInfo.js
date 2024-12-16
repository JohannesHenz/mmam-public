function getStopInfo() {
  const stopName = $("#stop-info-input").val();
  const dataType = $("#data-type-select").val(); // Get selected data type
  console.log("Sending stopName and dataType to server:", stopName, dataType);
  // Send a POST request to your server with the entered stopName
  $.ajax({
    type: "POST",
    url: "/stop-info",
    contentType: "application/json",
    Accept: "application/json",
    data: JSON.stringify({ stopName: stopName, dataType: dataType }),
    success: function (response) {
        console.log("Response from server:", response);
      if (dataType === "oebb" || dataType === "both") {
        displayOebbInfo(response);
      }
      if (dataType === "wienerlinien" || dataType === "both") {
        $("#wienerlinienInfo").show(); // Ensure the window is shown
        displayWienerLinienInfo(response);
      }
    },
    error: function (error) {
      // Handle errors, e.g., display an error message;
      console.error("Error fetching stop info:", error);
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
  $("#wienerlinienInfo").show();
  $("#wienerlinien-data").empty();
  stopData.lines.forEach((lineInfo) => {

  if (!info || info.length === 0) {
    $("#wienerlinien-data").append("<p>No information available</p>");
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
    $("#wienerlinien-data").append(table);
}
  
  });}
