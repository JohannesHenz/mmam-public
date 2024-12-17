$(document).ready(function () {
  // Hide disruptions card initially
  $("#disruptions").hide();

  // Make the disruptions window draggable
  $("#disruptions").draggable({
    handle: ".card-header", // Make only the header draggable
  });

  // Close button handler
  $("#close-disruptions").click(function () {
    $("#disruptions").hide();
  });

  // Fetch and display disruptions initially
  fetchDisruptions();

  // Event listener for changes in the station name
  $("#station").on("DOMSubtreeModified", function () {
    const stationName = $(this).text().replace("Station: ", "").trim();
    if (stationName) {
      fetchDisruptionsForStation(stationName);
    }
  });

  // Event listeners for tabs
  $("#disruption-tabs .nav-link").on("click", function () {
    selectedCategory = $(this).data("category");
    applyFilters();
  });
});

let cachedDisruptions = []; // Store disruptions so we can re-filter without fetching again
let connectedLinesCache = [];
let uniqueMapCache = new Map();
let selectedCategory = "alle"; // Default category

async function fetchDisruptionsForStation(stationName) {
  try {
    const response = await fetch(
      `/disruptions?station=${encodeURIComponent(stationName)}`
    );
    const disruptions = await response.json();
    cachedDisruptions = disruptions;
    updateDisruptionsList(disruptions);
  } catch (error) {
    console.error("Error fetching disruptions:", error);
  }
}

async function fetchDisruptions() {
  try {
    const response = await fetch("/disruptions");
    const disruptions = await response.json();
    cachedDisruptions = disruptions;
    updateDisruptionsList(disruptions);
  } catch (error) {
    console.error("Error fetching disruptions:", error);
  }
}

// Applies current filters to the cached disruptions
function applyFilters() {
  updateDisruptionsList(cachedDisruptions, connectedLinesCache);
}

async function updateDisruptionsList(disruptions) {
  console.log("stop-info-oebb-input", $("#stop-info-oebb-input").val());
  const currentStation = $("#stop-info-oebb-input").val();
  connectedLinesCache = (await getConnectedLines(currentStation)) || [];

  // Determine categories to show based on selectedCategory
  // If "alle", show all, else filter by category
  const relevantDisruptions = disruptions.filter((disruption) => {
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
      connectedLinesCache.includes(line)
    );

    let categoryMatches = true;
    if (selectedCategory !== "alle") {
      categoryMatches = disruption.category === selectedCategory;
    }

    return (isRelatedToStation || isRelatedToConnectedLines) && categoryMatches;
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

  // Deduplicate disruptions by title and description
  const uniqueMap = new Map();
  relevantDisruptions.forEach((disruption) => {
    let lines = Array.isArray(disruption.relatedLines)
      ? disruption.relatedLines
      : [];
    let title = disruption.title ? disruption.title.trim() : "";
    let description = disruption.description
      ? disruption.description.trim()
      : "";

    title = title.replace(/\n+/g, " ");
    description = description.replace(/\n+/g, " ");

    title = title.replace(/>\s*$/, "").trim();
    description = description.replace(/>\s*$/, "").trim();

    const key = title + "|" + description;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, {
        title: title,
        description: description,
        elevator: disruption.elevator,
        lines: new Set(lines),
      });
    } else {
      const existing = uniqueMap.get(key);
      lines.forEach((line) => existing.lines.add(line));
    }
  });

  uniqueMap.forEach((value) => {
    const lineList = Array.from(value.lines).join(", ") || "Keine";
    let finalTitle = value.title;
    let finalDescription = value.description;
    if (finalDescription === finalTitle || !finalDescription) {
      finalDescription = "";
    }

    let htmlContent = `<strong>${finalTitle}</strong><br><small class="text-muted">Linien: ${lineList}</small>`;
    if (finalDescription) {
      htmlContent += `<br><em>${finalDescription}</em>`;
    }

    const item = $("<div>")
      .addClass("list-group-item disruption-item")
      .addClass(value.elevator ? "elevator-disruption" : "regular-disruption")
      .html(htmlContent);

    list.append(item);
  });

  uniqueMapCache = uniqueMap;
}

async function getConnectedLines(stationName) {
  if (!stationName) {
    console.error("getConnectedLines: stationName is required");
    return [];
  }

  try {
    const encodedURIComponent = encodeURIComponent(stationName);
    const url =
      "https://localhost:443/stop-info/connected-lines/" + encodedURIComponent;

    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fetch error:", response.status, errorText);
      throw new Error("Failed to fetch connected lines");
    }

    const lines = await response.json();
    return lines;
  } catch (error) {
    console.error("Error in getConnectedLines:", error);
    return [];
  }
}

$(document).ready(function () {
  $("#stop-info-oebb-input").on("change", function () {
    fetchDisruptions();
  });
});
