const path = require('path');
const loadModule = require('./helpers/loadModule');

const weatherPath = path.join(__dirname, '../routes/weather.js');
const weather = loadModule(weatherPath, {
  '../database': {},
  'express-promise-router': () => ({ get: () => {}, post: () => {} }),
  axios: {},
  '../utils/logger': {},
  '../utils/location': { getLocation: () => ({ latitude: 0, longitude: 0 }) }
});
const { convertForecast } = weather;

describe('convertForecast', () => {
  test('maps API data', () => {
    const input = {
      timestamps: ['t1', 't2'],
      features: [
        {
          properties: {
            parameters: {
              t2m: { data: [10.4, 15.6] },
              sy: { data: [1, 2] }
            }
          }
        }
      ]
    };
    const result = JSON.parse(JSON.stringify(convertForecast(input)));
    expect(result).toEqual([
      { timestamp: 't1', temperature: 10, symbol: 1 },
      { timestamp: 't2', temperature: 16, symbol: 2 }
    ]);
  });
});
