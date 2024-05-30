const express = require('express');
const { setLocation } = require('../utils/location');
const router = express.Router();

router.post('/set', (req, res) => {
  const { latitude, longitude } = req.body;
  if (latitude && longitude) {
    setLocation(latitude, longitude);
    res.status(200).send('Location set successfully');
  } else {
    res.status(400).send('Invalid location data');
  }
});

module.exports = router;
