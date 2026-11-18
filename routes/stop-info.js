const fs = require("fs");
const path = require("path");
const axios = require("axios");
const csvParser = require("csv-parser");
const router = require("express-promise-router")();
const database = require("../database");
const logger = require("../utils/logger");

const WL_MONITOR_URL = "https://www.wienerlinien.at/ogd_realtime/monitor";
const WL_STOPS_CSV_URL =
  "https://www.wienerlinien.at/ogd_realtime/doku/ogd/wienerlinien-ogd-haltepunkte.csv";
const csvFilePath = path.join(
  __dirname,
  "..",
  "wienerlinien",
  "wienerlinien-ogd-haltepunkte.csv"
);
const DB_POLL_INTERVAL = 3000;

// ---------------------------------------------------------------------------
// Wiener Linien realtime API
// ---------------------------------------------------------------------------

/**
 * Fetches the realtime monitors for a Wiener Linien stop.
 * Returns an empty array on any error so callers can aggregate safely.
 */
async function fetchWienerLinienMonitors(stopId, extraParams = {}) {
  if (!stopId) {
    logger.warn("fetchWienerLinienMonitors: no stopId provided");
    return [];
  }

  try {
    const response = await axios.get(WL_MONITOR_URL, {
      params: { stopId, ...extraParams },
    });
    return response.data?.data?.monitors ?? [];
  } catch (error) {
    logger.error(`Wiener Linien API request failed for stop ${stopId}: ${error.message}`);
    return [];
  }
}

function sortByDeparture(departures) {
  return departures.sort((a, b) => new Date(a.departure) - new Date(b.departure));
}

async function getConnectedLinesFromAPI(stopId) {
  const monitors = await fetchWienerLinienMonitors(stopId, {
    activeTrafficInfo: "stoerungkurz",
  });

  const lines = new Set();
  monitors.forEach((monitor) => {
    (monitor.lines || []).forEach((line) => {
      if (line?.name) lines.add(line.name);
    });
  });
  return Array.from(lines);
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// All departures for every Wiener Linien stop matching `stopName`.
router.post("/", async (req, res) => {
  try {
    const { stopName } = req.body;

    const result = await database.query(
      "SELECT DISTINCT stopid FROM haltepunkte WHERE stoptext ILIKE $1",
      [`%${stopName}%`]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Stop not found" });
    }

    const allMonitors = await Promise.all(
      result.rows.map((row) => fetchWienerLinienMonitors(row.stopid))
    );

    const seenDepartures = new Set();
    const departures = [];
    allMonitors.flat().forEach((monitor) => {
      (monitor.lines || []).forEach((line) => {
        (line.departures?.departure || []).forEach((dep) => {
          const departure = {
            line: line.name,
            direction: line.towards,
            departure: dep.departureTime.timePlanned,
          };
          const key = `${departure.line}-${departure.direction}-${departure.departure}`;
          if (!seenDepartures.has(key)) {
            seenDepartures.add(key);
            departures.push(departure);
          }
        });
      });
    });

    res.json({ data: sortByDeparture(departures) });
  } catch (error) {
    logger.error(`POST /stop-info: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Wiener Linien lines serving the stop nearest to an ÖBB station.
router.get("/connected-lines/:stopName", async (req, res) => {
  const oebbStopName = req.params.stopName;
  try {
    const oebbQuery = `
      SELECT latitude, longitude
      FROM stationoebb
      WHERE "stationname" ILIKE $1
         OR "stationname" ILIKE $2
         OR "stationname" ILIKE $3
         OR "stationname" ILIKE $4
    `;
    const searchPatterns = [
      oebbStopName,
      oebbStopName.replace(" (U)", ""),
      oebbStopName.replace("Bahnhst", "Bahnhof"),
      oebbStopName.replace(" (U)", "").replace("Bahnhst", "Bahnhof"),
    ];
    const oebbResult = await database.query(oebbQuery, searchPatterns);
    if (oebbResult.rows.length === 0) {
      return res.json([]);
    }

    const { latitude, longitude } = oebbResult.rows[0];
    const wlQuery = `
      SELECT stoptext, stopid,
             point($1, $2) <-> point(latitude, longitude) AS distance
      FROM haltepunkte
      WHERE point($1, $2) <-> point(latitude, longitude) < 0.01
      ORDER BY distance ASC
      LIMIT 1
    `;
    const wlResult = await database.query(wlQuery, [latitude, longitude]);
    if (!wlResult.rows.length) {
      return res.json([]);
    }

    res.json(await getConnectedLinesFromAPI(wlResult.rows[0].stopid));
  } catch (error) {
    logger.error(`GET /stop-info/connected-lines/${oebbStopName}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Next departure per line for the Wiener Linien stop(s) matching an ÖBB station name.
router.get("/wienerlinien/:stopName", async (req, res) => {
  try {
    const stopName = req.params.stopName;
    const searchPatterns = [
      stopName,
      stopName.replace(" (U)", ""),
      stopName.replace("Wien ", ""),
      stopName.replace(" Bahnhof", ""),
      stopName.replace(" (U)", "").replace("Wien ", ""),
      stopName.replace(" (U)", "").replace(" Bahnhof", ""),
      stopName.replace("Wien ", "").replace(" Bahnhof", ""),
    ].map((pattern) => `%${pattern}%`);

    const result = await database.query(
      "SELECT DISTINCT stopid FROM haltepunkte WHERE stoptext ILIKE ANY($1)",
      [searchPatterns]
    );
    if (!result.rows.length) {
      return res.status(404).json({
        error: "Stop not found",
        searchedFor: stopName,
        patternsUsed: searchPatterns,
      });
    }

    const allMonitors = await Promise.all(
      result.rows.map((row) => fetchWienerLinienMonitors(row.stopid))
    );

    const seenDepartures = new Set();
    const departures = [];
    allMonitors.flat().forEach((monitor) => {
      const line = monitor.lines?.[0];
      if (!line) return;

      const departure = {
        line: line.name,
        direction: line.towards,
        departure: line.departures.departure[0].departureTime.timePlanned,
      };
      const key = `${departure.line}-${departure.direction}-${departure.departure}`;
      if (!seenDepartures.has(key)) {
        seenDepartures.add(key);
        departures.push(departure);
      }
    });

    res.json({ data: sortByDeparture(departures) });
  } catch (error) {
    logger.error(`GET /stop-info/wienerlinien: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Initial import of Wiener Linien stops (haltepunkte) into Postgres
// ---------------------------------------------------------------------------

async function downloadCSVFile() {
  if (fs.existsSync(csvFilePath)) return;

  try {
    logger.info("Downloading Wiener Linien stops CSV...");
    const response = await axios.get(WL_STOPS_CSV_URL, { responseType: "arraybuffer" });
    fs.writeFileSync(csvFilePath, response.data);
    logger.success("Wiener Linien stops CSV downloaded.");
  } catch (error) {
    logger.error(`Error downloading CSV file: ${error.message}`);
  }
}

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csvParser({ separator: ";" }))
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

async function isHaltepunkteTableEmpty() {
  const result = await database.query("SELECT COUNT(*) FROM haltepunkte");
  return parseInt(result.rows[0].count, 10) === 0;
}

async function insertDataIntoDatabase(rows) {
  const insertQuery =
    "INSERT INTO haltepunkte (stopid, diva, stoptext, municipality, municipalityid, longitude, latitude) VALUES ($1, $2, $3, $4, $5, $6, $7)";

  await database.query("BEGIN");
  try {
    let skipped = 0;
    for (const row of rows) {
      const stopId = parseInt(row.StopID);
      const diva = parseInt(row.DIVA);
      const municipalityId = parseInt(row.MunicipalityID);

      if (isNaN(stopId) || isNaN(diva) || isNaN(municipalityId)) {
        skipped++;
        continue;
      }

      await database.query(insertQuery, [
        stopId,
        diva,
        row.StopText,
        row.Municipality,
        municipalityId,
        parseFloat(row.Longitude),
        parseFloat(row.Latitude),
      ]);

      if (stopId === 9999) break;
    }
    await database.query("COMMIT");
    if (skipped) logger.warn(`Skipped ${skipped} CSV rows with missing/invalid ids.`);
  } catch (error) {
    await database.query("ROLLBACK");
    throw error;
  }
}

async function populateDatabase() {
  await downloadCSVFile();

  try {
    if (!(await isHaltepunkteTableEmpty())) {
      logger.info("haltepunkte table already populated, skipping import.");
      return;
    }

    const rows = await readCSV(csvFilePath);
    if (rows.length > 0) {
      await insertDataIntoDatabase(rows);
      logger.success("haltepunkte imported into the database.");
    }
  } catch (error) {
    logger.error(`Error populating database: ${error.message}`);
  }
}

// Wait for the database connection, then run the one-time import.
const dbWaitInterval = setInterval(async () => {
  if (database.connected) {
    clearInterval(dbWaitInterval);
    await populateDatabase();
  }
}, DB_POLL_INTERVAL);

module.exports = router;
