const path = require('path');
const loadModule = require('./helpers/loadModule');

const settingsPath = path.join(__dirname, '../routes/settings.js');
const settings = loadModule(settingsPath, {
  '../database': {},
  '../utils/logger': {},
  'express-promise-router': () => ({ get: () => {}, post: () => {} })
});
const { checkObject } = settings;

const blueprint = {
  latitude: ['number', -90, 90],
  longitude: ['number', -180, 180],
  zoom: ['number', 1, 20],
};

describe('checkObject', () => {
  test('valid object passes', () => {
    const obj = { latitude: 10, longitude: 20, zoom: 5 };
    expect(checkObject(obj, blueprint)).toBeNull();
  });

  test('missing property fails', () => {
    const obj = { latitude: 10, longitude: 20 };
    expect(checkObject(obj, blueprint)).toContain('zoom');
  });

  test('type mismatch fails', () => {
    const obj = { latitude: '10', longitude: 20, zoom: 5 };
    expect(checkObject(obj, blueprint)).toContain('not a number');
  });

  test('range check fails', () => {
    const obj = { latitude: -100, longitude: 20, zoom: 5 };
    expect(checkObject(obj, blueprint)).toContain('too small');
  });
});
