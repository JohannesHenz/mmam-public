const routes = (server) => {
  server.use("/", require("./root"));
  server.use("/weather", require("./weather"));
  server.use("/settings", require("./settings"));
  server.use("/journeys", require("./journeys"));
  server.use("/stop-info", require("./stop-info"));
  server.use("/location", require("./location"));
  server.use("/disruptions", require("./disruptions"));
};

module.exports = routes;
