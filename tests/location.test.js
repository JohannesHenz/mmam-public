const test = require('node:test');
const assert = require('node:assert/strict');
const { setLocation, getLocation } = require('../utils/location');

test('setLocation updates coordinates', () => {
  setLocation(48.2, 16.3);
  assert.deepStrictEqual(getLocation(), { latitude: 48.2, longitude: 16.3 });
});

