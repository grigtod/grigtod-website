// Your fixed city center
const center = L.latLng(50.4445, 18.8554);

// Panning lock around center
const radiusMeters = 3000;
const bounds = center.toBounds(radiusMeters * 2);

// Distance warning threshold
const tooFarThresholdMeters = 2000;

// Map init
const map = L.map("map", {
  center,
  zoom: 18,
  maxBounds: bounds,
  maxBoundsViscosity: 0.1
});

L.tileLayer(
     "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    //"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", 
    {
  maxZoom: 20,
  minZoom: 14,
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>'//'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// UI elements
const locationBanner = document.getElementById("locationBanner");
const bannerText = document.getElementById("bannerText");
//const enableLocationBtn = document.getElementById("enableLocationBtn");
const dismissBannerBtn = document.getElementById("dismissBannerBtn");

const myLocationBtn = document.getElementById("myLocationBtn");
const centerBtn = document.getElementById("centerBtn");

const distanceBanner = document.getElementById("distanceBanner");

// State
let userLatLng = null;
let userMarker = null;
let userAccuracyCircle = null;

function showBanner(message) {
  bannerText.textContent = message;
  locationBanner.classList.remove("banner-hidden");
}

function hideBanner() {
  locationBanner.classList.add("banner-hidden");
}

function showTooFar(show) {
  if (show) distanceBanner.classList.remove("banner-hidden");
  else distanceBanner.classList.add("banner-hidden");
}

function setMyLocationEnabled(enabled) {
  myLocationBtn.disabled = !enabled;
}

function updateTooFarMessage() {
  if (!userLatLng) {
    showTooFar(false);
    return;
  }
  const dist = map.distance(center, userLatLng);
  showTooFar(dist > tooFarThresholdMeters);
}

function renderUserLocation(pos) {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const accuracy = pos.coords.accuracy;

  userLatLng = L.latLng(lat, lng);

  if (!userMarker) {
    userMarker = L.circleMarker(userLatLng, {
      radius: 7
    }).addTo(map);

    userAccuracyCircle = L.circle(userLatLng, {
      radius: accuracy
    }).addTo(map);
  } else {
    userMarker.setLatLng(userLatLng);
    userAccuracyCircle.setLatLng(userLatLng);
    userAccuracyCircle.setRadius(accuracy);
  }

  setMyLocationEnabled(true);
  hideBanner();
  updateTooFarMessage();
}

function handleLocationError(err) {
  userLatLng = null;
  setMyLocationEnabled(false);
  updateTooFarMessage();

  // Friendly messaging
  if (err && err.code === 1) {
    showBanner("For the full experience, please allow location access.");
    return;
  }
  showBanner("Location is unavailable right now. Please try again.");
}

function requestLocation() {
  if (!navigator.geolocation) {
    showBanner("Your browser does not support location.");
    setMyLocationEnabled(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => renderUserLocation(pos),
    (err) => handleLocationError(err),
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    }
  );
}

// Buttons
myLocationBtn.addEventListener("click", () => {
  if (!userLatLng) return;
  map.setView(userLatLng, Math.max(map.getZoom(), 18));
});

centerBtn.addEventListener("click", () => {
  map.setView(center, 18);
});

/*enableLocationBtn.addEventListener("click", () => {
  // This triggers the permission prompt in most browsers
  requestLocation();
});*/

dismissBannerBtn.addEventListener("click", () => {
  hideBanner();
});

// On start, request permission and show banner if denied
document.addEventListener("DOMContentLoaded", () => {
  requestLocation();
});
