const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadModule(filename, mocks) {
  const code = fs.readFileSync(filename, 'utf8');
  const sandbox = {
    module: { exports: {} },
    exports: {},
    require: (id) => (id in mocks ? mocks[id] : require(id))
  };
  vm.runInNewContext(code, sandbox, { filename });
  return sandbox.module.exports;
}

const weatherPath = path.join(__dirname, '../routes/weather.js');
const weather = loadModule(weatherPath, {
  '../database': {},
  'express-promise-router': () => ({ get: () => {}, post: () => {} }),
  axios: {},
  '../utils/logger': {},
  '../utils/location': { getLocation: () => ({ latitude: 0, longitude: 0 }) }
});
const convertForecast = weather.convertForecast;

test('convertForecast maps API data', () => {
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
  assert.deepStrictEqual(result, [
    { timestamp: 't1', temperature: 10, symbol: 1 },
    { timestamp: 't2', temperature: 16, symbol: 2 }
  ]);
});

