const database = require('../database');
const router = require('express-promise-router')();
const logger = require('../utils/logger');

router.get('/', async (request, response) => {
    const data = await database.query('SELECT * from settings WHERE id = 1');
    response.setHeader('Content-Type', 'application/json');
    delete data.rows[0].id;
    response.send(data.rows[0]);
});

const settingsBlueprint = {
    // key : [type, min, max]
    latitude: ['number', -90, 90],
    longitude: ['number', -180, 180],
    zoom: ['number', 1, 20]
};

function checkObject(object, blueprint) {
    for (const key in blueprint) {
        if (object[key] === undefined) {
            return `.${key} is missing`;
        }
        if (typeof object[key] !== blueprint[key][0]) {
            return `.${key} is not a ${blueprint[key][0]}`;
        }
        // key : [type, length] // string
        if (blueprint[key][0] === 'string') {
            if (object[key].length > blueprint[key][1]) {
                return `.${key} is too long (max: ${blueprint[key][1]})`;
            }
        }
        // key : [type, min, max] // number
        if (blueprint[key][0] === 'number') {
            if (object[key] < blueprint[key][1]) {
                return `.${key} is too small (min: ${blueprint[key][1]})`;
            }
            if (object[key] > blueprint[key][2]) {
                return `.${key} is too big (max: ${blueprint[key][2]})`;
            }
        }

    }
    return null;
}

router.post('/', async (request, response) => {
    const body = request.body;
    logger.debug('POST /settings', body);

    const result = checkObject(body, settingsBlueprint);
    if (result !== null) {
        response.status(400).send(result);
        return;
    }

    await database.query(
        'UPDATE settings SET latitude = $1, longitude = $2, zoom = $3 WHERE id = 1',
        [body.latitude, body.longitude, body.zoom]
    );
    response.setHeader('Content-Type', 'application/json');
    response.status(200).send();
});

module.exports = router;
module.exports.checkObject = checkObject;

