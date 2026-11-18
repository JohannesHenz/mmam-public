require("dotenv").config();
const fs = require("fs");
const https = require("https");
const path = require("path");
const express = require("express");
const cors = require("cors");
const favicon = require("serve-favicon");
const logger = require("./utils/logger");
const routes = require("./routes");

const port = process.env.PORT || 443;
const tlsOptions = {
  key: fs.readFileSync(process.env.TLS_KEY_PATH || path.join(__dirname, "certs", "key.pem")),
  cert: fs.readFileSync(process.env.TLS_CERT_PATH || path.join(__dirname, "certs", "cert.pem")),
};

const server = express();
server.set("view engine", "ejs");

server.use(express.json());
server.use(cors());
server.use(express.static(path.join(__dirname, "public")));
server.use(favicon(path.join(__dirname, "public", "favicon.ico")));
server.use((request, response, next) => {
  logger.debug(`${request.method} ${request.url}`);
  next();
});

routes(server);

https.createServer(tlsOptions, server).listen(port, () => {
  logger.success(`Listening: https://localhost:${port}`);
});
