const express = require('express');
const request = require('supertest');
const locationRouter = require('../routes/location');
const { getLocation } = require('../utils/location');

const app = express();
app.use(express.json());
app.use('/location', locationRouter);

describe('location route', () => {
  beforeEach(() => {
    // reset location
    const loc = require('../utils/location');
    loc.setLocation(null, null);
  });

  test('POST /location/set stores coordinates', async () => {
    await request(app)
      .post('/location/set')
      .send({ latitude: 1, longitude: 2 })
      .expect(200);

    expect(getLocation()).toEqual({ latitude: 1, longitude: 2 });
  });

  test('POST /location/set with missing data', async () => {
    await request(app)
      .post('/location/set')
      .send({ latitude: 1 })
      .expect(400);
  });
});
