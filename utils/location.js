let userLocation = {
  latitude: null,
  longitude: null,
};

function setLocation(latitude, longitude) {
  userLocation.latitude = latitude;
  userLocation.longitude = longitude;
}

function getLocation() {
  return userLocation;
}

module.exports = {
  setLocation,
  getLocation,
};
