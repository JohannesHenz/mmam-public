const logger = require('./utils/logger');
const favicon = require('serve-favicon');
const express = require('express');
const server = express();
const path = require('path');

const port = 3313;


server.set('view engine', 'ejs');
server.use(express.static(__dirname + '/public'));
server.use(favicon(path.join(__dirname, '/public', 'favicon.ico')));

server.use((request, response, next) => {
    logger.debug(`${request.ip}: ${request.method} ${request.url}`);
    next();
});

require('./routes')(server);

server.listen(port, () => {
    logger.success(`Listening: http://localhost:${port}`);
});