const logger = require('./utils/logger');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const express = require('express');
const server = express();
const cors = require('cors');
const path = require('path');

const port = 3313;


server.set('view engine', 'ejs');
server.use(bodyParser.json());
server.use(cors());
server.use(express.static(__dirname + '/public'));
server.use(favicon(path.join(__dirname, '/public', 'favicon.ico')));

server.use((request, response, next) => {
    console.log(`Request: ${request.method} ${request.url}`);
    next();
});

require('./routes')(server);

server.listen(port, () => {
    logger.success(`Listening: http://localhost:${port}`);
});