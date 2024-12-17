require("dotenv").config();
const fs = require("fs");
const https = require("https");
const express = require("express");
const logger = require("./utils/logger");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");

const port = 443; // Changed from 3313 to 443

const server = express();
server.set("view engine", "ejs");
server.use("/disruptions", require("./routes/disruptions"));
server.use(bodyParser.json());
server.use(cors());
server.use(express.static(path.join(__dirname, "public")));
server.use(favicon(path.join(__dirname, "public", "favicon.ico")));

server.use((request, response, next) => {
  console.log(`Request: ${request.method} ${request.url}`);
  next();
});

server.use("/location", require("./routes/location"));
server.use("/weather", require("./routes/weather"));
server.use("/stop-info", require("./routes/stop-info"));

routes(server);

// Load SSL certificate and key
const options = {
  key: fs.readFileSync("/usr/src/app/certs/key.pem"),
  cert: fs.readFileSync("/usr/src/app/certs/cert.pem"),
};

// Create HTTPS server on port 443
https.createServer(options, server).listen(port, () => {
  logger.success(`Listening: https://localhost:${port}`);
});
