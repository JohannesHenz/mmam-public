const { setLocation, getLocation } = require('../utils/location');

describe('location utils', () => {
  test('setLocation updates coordinates', () => {
    setLocation(48.2, 16.3);
    expect(getLocation()).toEqual({ latitude: 48.2, longitude: 16.3 });
  });
});
