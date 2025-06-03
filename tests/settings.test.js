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

const settingsPath = path.join(__dirname, '../routes/settings.js');
const settings = loadModule(settingsPath, {
  '../database': {},
  'express-promise-router': () => ({ get: () => {}, post: () => {} })
});
const checkObject = settings.checkObject;

const blueprint = {
  latitude: ['number', -90, 90],
  longitude: ['number', -180, 180],
  zoom: ['number', 1, 20],
};

test('valid object passes', () => {
  const obj = { latitude: 10, longitude: 20, zoom: 5 };
  assert.equal(checkObject(obj, blueprint), null);
});

test('missing property fails', () => {
  const obj = { latitude: 10, longitude: 20 };
  assert.ok(checkObject(obj, blueprint).includes('zoom'));
});

test('type mismatch fails', () => {
  const obj = { latitude: '10', longitude: 20, zoom: 5 };
  assert.ok(checkObject(obj, blueprint).includes('not a number'));
});

test('range check fails', () => {
  const obj = { latitude: -100, longitude: 20, zoom: 5 };
  assert.ok(checkObject(obj, blueprint).includes('too small'));
});

