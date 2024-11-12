const fs = require("fs");
const database = require("../database");
const csvParser = require("csv-parser");
const router = require("express-promise-router")();
const axios = require("axios");
const path = require("path");

let wienerLinienData = null;

// Function to fetch data from Wiener Linien API using stopId
async function fetchWienerLinienData(StopID) {
  if (!StopID) {
    console.error("No StopID provided");
    return [];
  }

  try {
    console.log("Fetching data for StopID:", StopID);
    const url = `https://www.wienerlinien.at/ogd_realtime/monitor?stopId=${StopID}`;
    console.log("WL API URL:", url);

    const response = await axios(url);
    console.log("Wiener Linien API response:", response.data);

    if (!response.data || !response.data.data || !response.data.data.monitors) {
      console.error("Invalid response structure:", response.data);
      return [];
    }

    return response.data.data.monitors;
  } catch (error) {
    console.error("Error in fetchWienerLinienData:", error);
    return [];
  }
}

async function fetchWienerLinienDataForDisruptions(StopID) {
    if (!StopID) {
      console.error("No StopID provided");
      return [];
    }
  
    try {
      console.log("Fetching data for StopID:", StopID);
      const url = `https://www.wienerlinien.at/ogd_realtime/monitor?stopId=${StopID}&activeTrafficInfo=stoerungkurz`;
      console.log("WL API URL:", url);
  
      const response = await axios(url);
      console.log("Wiener Linien API response:", response.data);
  
      if (!response.data || !response.data.data || !response.data.data.monitors) {
        console.error("Invalid response structure:", response.data);
        return [];
      }
  
      return response.data.data.monitors;
    } catch (error) {
      console.error("Error in fetchWienerLinienData:", error);
      return [];
    }
  }

router.post("/", async (request, response) => {
  console.log("POST request to /wienerlinien/stop-info received");
  console.log("Request Body:", request.body); // Log the entire request body

  const stopName = request.body.stopName;
  console.log("Received stopName:", stopName);

  // Look up the stopId based on the stopName
  const StopID = await getStopId(stopName);
  console.log("Resolved stopId:", StopID);

  if (!StopID) {
    response.status(404).json({ error: "Stop not found" });
    return;
  }

  try {
    // Fetch data using the obtained stopId
    const wienerLinienResponse = await fetchWienerLinienData(StopID);
    console.log("Wiener Linien response:", wienerLinienResponse);

    // Send the Wiener Linien data back to the frontend
    response.json(wienerLinienResponse);
  } catch (error) {
    console.error("Error fetching Wiener Linien data:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

// Function to look up stopId based on stopName
async function getStopId(stopName) {
  try {
    console.log("Attempting to get stopId for stopName:", stopName);

    const query =
      'SELECT "StopID" FROM "haltepunkte" WHERE TRIM("stoptext") = $1';
    const result = await database.query(query, [stopName]);

    const StopIDs = result.rows.map((row) => row.stopid);

    console.log("Resolved stopId:", StopIDs);

    return StopIDs;
  } catch (error) {
    console.error("Error while getting stopIds:", error);
    return null;
  }
}

const csvFilePath = path.join(
  __dirname,
  "..",
  "wienerlinien",
  "wienerlinien-ogd-haltepunkte.csv"
);

async function downloadCSVFile() {
  try {
    // Check if the CSV file already exists
    if (!fs.existsSync(csvFilePath)) {
      console.log("Downloading CSV file...");

      // Download the CSV file from the provided link
      const response = await axios.get(
        "https://www.wienerlinien.at/ogd_realtime/doku/ogd/wienerlinien-ogd-haltepunkte.csv",
        { responseType: "arraybuffer" }
      );

      // Save the downloaded CSV file
      fs.writeFileSync(csvFilePath, response.data);

      console.log("CSV file downloaded successfully.");
    } else {
      console.log("CSV file already exists.");
    }
  } catch (error) {
    console.error("Error downloading CSV file:", error);
  }
}

//Function to check if the database is connected
function checkDatabaseConnectionPeriodically() {
  const intervalId = setInterval(async () => {
    if (database.connected) {
      clearInterval(intervalId); // Stop when connected
      console.log("Database connected. Running populateDatabase.");
      await populateDatabase();
    } else {
      console.log("Database not connected. Retrying...");
    }
  }, 3000); // Check every 3 seconds
}

async function isHaltepunkteTableEmpty() {
  const query = "SELECT COUNT(*) FROM haltepunkte";
  const result = await database.query(query);
  const rowCount = parseInt(result.rows[0].count, 10);
  return rowCount === 0;
}

async function populateDatabase() {
  await downloadCSVFile();

  try {
    // Check if the database is connected
    if (!database.connected) {
      console.error("Database is not connected. Aborting database population.");
      return;
    }

    // Check if haltepunkte table is already populated
    const isTableEmpty = await isHaltepunkteTableEmpty();

    if (isTableEmpty) {
      const data = await readCSV(csvFilePath);

      if (data.length > 0) {
        await insertDataIntoDatabase(data);
        console.log("Data inserted into the database successfully.");
      } else {
        console.log("No data to insert.");
      }
    } else {
      console.log(
        "Haltepunkte table is already populated. Skipping insertion."
      );
    }
  } catch (error) {
    console.error("Error populating database:", error);
  } finally {
    // Close the database connection when done
    await database.query("ROLLBACK");
  }
}

async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];

    fs.createReadStream(filePath)
      .pipe(csvParser({ separator: ";" }))
      .on("data", (row) => {
        data.push(row);
      })
      .on("end", () => {
        resolve(data);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function insertDataIntoDatabase(data) {
  const insertQuery =
    "INSERT INTO haltepunkte (stopid, diva, stoptext, municipality, municipalityid, longitude, latitude) VALUES ($1, $2, $3, $4, $5, $6, $7)";

  // Begin a transaction
  await database.query("BEGIN");

  try {
    for (const row of data) {
      console.log("Inserting row:", row);

      // Check if there is a StopID for the row
      if (
        row.StopID !== undefined &&
        row.StopID !== null &&
        row.StopID !== ""
      ) {
        const stopId = parseInt(row.StopID);
        const diva = parseInt(row.DIVA);
        const municipalityId = parseInt(row.MunicipalityID);

        if (!isNaN(stopId) && !isNaN(diva) && !isNaN(municipalityId)) {
          await database.query(insertQuery, [
            stopId,
            diva,
            row.StopText,
            row.Municipality,
            municipalityId,
            parseFloat(row.Longitude),
            parseFloat(row.Latitude),
          ]);

          // Check if the StopID is 9999 and stop the loop
          if (stopId === 9999) {
            console.log("Reached StopID 9999. Stopping insertion.");
            break;
          }
        } else {
          console.log(
            `Skipping row with invalid data: StopID=${row.StopID}, DIVA=${row.DIVA}, MunicipalityID=${row.MunicipalityID}`
          );
        }
      } else {
        console.log("Skipping row with missing StopID.");
      }
    }

    // Commit the transaction if all inserts succeed
    await database.query("COMMIT");
  } catch (error) {
    // Rollback the transaction if an error occurs
    await database.query("ROLLBACK");
    throw error;
  }
}

async function fetchAndSyncWienerLinienDataPeriodically(StopID) {
  try {
    console.log("Fetching and updating Wiener Linien data...");

    // Fetch data from Wiener Linien
    const newData = await fetchWienerLinienData(StopID);

    // Update the database with the new data
    //await updateDatabaseWithWienerLinienData(newData);

    console.log("Wiener Linien data updated successfully.");
  } catch (error) {
    console.error("Error fetching and updating Wiener Linien data:", error);
  }
  // Fetch and update every 30 seconds
}

// Function to update the database with new Wiener Linien data
async function updateDatabaseWithWienerLinienData(newData) {
  try {
    // Check if the database is connected
    if (!database.connected) {
      console.error("Database is not connected. Aborting database update.");
      return;
    }

    // Begin a transaction
    await database.query("BEGIN");

    // Clear existing data in the database
    await database.query("DELETE FROM wienerlinien_data");

    // Insert the new data into the database
    for (const row of newData) {
      await database.query(
        'INSERT INTO wienerlinien_data ("MonitorTitle", "LineName", "Towards", "DepartureTime") VALUES ($1, $2, $3, $4)',
        [
          row.monitorTitle,
          row.lineInfo.Name,
          row.lineInfo.towards,
          row.lineInfo.departureTime,
        ]
      );
    }

    // Commit the transaction if all inserts succeed
    await database.query("COMMIT");
  } catch (error) {
    // Rollback the transaction if an error occurs
    await database.query("ROLLBACK");
    throw error;
  }
}

fetchAndSyncWienerLinienDataPeriodically();

checkDatabaseConnectionPeriodically();
// Call the function to populate the database when the script is executed
populateDatabase();

router.get("/connected-lines/:stopName", async (req, res) => {
  console.log("Incoming request:", req);
  console.log("Request Params:", req.params);
  const oebbStopName = req.params.stopName; // Ensure this is defined outside the try block
  try {
    console.log("1. Received ÖBB station name:", oebbStopName);

    // Get ÖBB coordinates
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

    console.log("2. Executing ÖBB query with params:", searchPatterns);
    const oebbResult = await database.query(oebbQuery, searchPatterns);
    console.log("3. ÖBB query result:", oebbResult.rows);

    if (oebbResult.rows.length === 0) {
      console.log("4a. No ÖBB station found");
      return res.json([]);
    }

    const { latitude, longitude } = oebbResult.rows[0];
    console.log("4b. Found coordinates:", { latitude, longitude });

    // Find nearest Wiener Linien station
    const wlQuery = `
    SELECT  stoptext, stopid,
           point($1, $2) <-> point(latitude, longitude) as distance
    FROM haltepunkte
    WHERE point($1, $2) <-> point(latitude, longitude) < 0.01
    ORDER BY distance ASC
    LIMIT 1
  `;

    console.log("4c. wlQuery:", wlQuery);

    console.log("5. Executing WL query with coordinates:", [
      latitude,
      longitude,
    ]);
    const wlResult = await database.query(wlQuery, [latitude, longitude]);
    console.log("6. WL query result:", wlResult.rows[0]);

    if (!wlResult.rows.length) {
      console.log("7a. No nearby WL station found");
      return res.json([]);
    }

    console.log("7b. Found WL station:", wlResult.rows[0]);
    console.log("7c. WL stopId:", wlResult.rows[0].stopid);
    const connectedLines = await getConnectedLinesFromAPI(
      wlResult.rows[0].stopid
    );
    console.log("8. Connected lines:", connectedLines);
    res.json(connectedLines);
  } catch (error) {
    console.error("Detailed error in /connected-lines:", {
      error: error.message,
      stack: error.stack,
      stopName: oebbStopName, // This will now be defined
    });
    res.status(500).json({ error: error.message });
  }
});

async function getWienerLinienStopId(stopName) {
  try {
    const query = "SELECT stopid FROM haltepunkte WHERE stoptext ILIKE $1";
    const result = await database.query(query, [stopName]);
    return result.rows[0]?.StopID;
  } catch (error) {
    console.error("Error getting Wiener Linien stop ID:", error);
    return null;
  }
}

async function getConnectedLinesFromAPI(stopId) {
  try {
    console.log("Fetching lines for stopId:", stopId);
    const response = await fetchWienerLinienDataForDisruptions(stopId);
    console.log("WL API response:", response);

    const lines = new Set();

    if (Array.isArray(response)) {
      response.forEach((monitor) => {
        if (monitor.lines && Array.isArray(monitor.lines)) {
          monitor.lines.forEach((line) => {
            if (line && line.name) {
              lines.add(line.name);
            }
          });
        }
      });
    }

    const result = Array.from(lines);
    console.log("Extracted lines:", result);
    return result;
  } catch (error) {
    console.error("Error getting connected lines:", error);
    return [];
  }
}

async function mapOebbToWienerLinien(oebbStopName) {
  try {
    // First get the coordinates from the ÖBB station
    const oebbQuery =
      "SELECT latitude, longitude FROM stationoebb WHERE stationname ILIKE $1 OR stationname ILIKE $2 OR stationname ILIKE $3 OR stationname ILIKE $4";
    const oebbResult = await database.query(oebbQuery, [
      oebbStopName,
      oebbStopName.replace(" (U)", ""),
      oebbStopName.replace("Bahnhst", "Bahnhof"),
      oebbStopName.replace(" (U)", "").replace("Bahnhst", "Bahnhof"),
    ]);

    if (oebbResult.rows.length === 0) {
      return null;
    }

    const { latitude, longitude } = oebbResult.rows[0];

    // Find the closest Wiener Linien station by coordinates
    const wlQuery = `
            SELECT stoptext, stopid,
                   point($1, $2) <-> point(latitude, longitude) as distance
            FROM haltepunkte
            WHERE point($1, $2) <-> point(latitude, longitude) < 0.01
            ORDER BY distance ASC
            LIMIT 1
        `;

    const wlResult = await database.query(wlQuery, [latitude, longitude]);

    if (wlResult.rows.length > 0) {
      return wlResult.rows[0].stationName;
    }

    return null;
  } catch (error) {
    console.error("Error mapping station name:", error);
    return null;
  }
}

module.exports = router;
