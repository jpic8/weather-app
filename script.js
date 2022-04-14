"use strict";

// DOM elements
const locationInput = document.querySelector("#location-name");
const locationSearchBtn = document.querySelector("#location-name-search");
const output = document.querySelector(".output");
const toggle = document.querySelector("#units");
const geoSearchBtn = document.querySelector("#geosearch");

// event listeners
locationSearchBtn.onclick = () => validateInput(locationInput);
geoSearchBtn.onclick = () => findLocation();
locationInput.onkeydown = (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();
    validateInput(locationInput);
  } else if (e.keyCode === 27) {
    e.preventDefault();
    locationInput.value = "";
    clearDOM();
    searchInstructions();
  }
};
window.onload = () => searchInstructions();

// utility functions
function clearDOM() {
  while (output.firstChild) {
    output.removeChild(output.firstChild);
  }
}

function searchInstructions() {
  const instructDiv = document.createElement("div");
  instructDiv.classList.add("search-instructions");
  const message = [
    "Please enter location with commas as separators",
    "city, state, country*",
    "zip code, country*",
    "latitude, longitude",
    "*optional, US default (ISO 3166 country codes)",
  ];
  for (let i = 0; i < message.length; i++) {
    let p = document.createElement("p");
    p.textContent = message[i];
    instructDiv.appendChild(p);
    output.appendChild(instructDiv);
  }
}

// finds location with geolocation navigator
function findLocation() {
  if (navigator.geolocation) {
    const options = {
      maximumAge: 600000,
      timeout: 10000,
      enableHighAccuracy: false,
    };
    navigator.geolocation.getCurrentPosition(sendPosition, inputAlert, options);
  } else {
    console.log("no location, sorry");
  }
}

function sendPosition(position) {
  console.log(position.coords.accuracy);
  const search = [position.coords.latitude, position.coords.longitude];
  console.log(search);
  geocoderReverse(search);
  //validateGeoForm(search);
}

// validates user input and directs to appropriate geolocation path
function validateInput(search) {
  if (search.value === undefined || search.value === "") {
    inputAlert();
  } else {
    const inspect = search.value.split("");
    if (isNaN(inspect[0]) && inspect[0] !== "-") {
      validateLocationForm(search);
    } else if (search.value.includes(".") || search.value.includes("-")) {
      validateGeoForm(search);
    } else {
      validateZipForm(search);
    }
  }
}

// processes any input errors and appends to alert message to DOM
function inputAlert(err) {
  clearDOM();
  const alertDiv = document.createElement("div");
  alertDiv.classList.add("input-alert");
  if (err === undefined || err.cod === "") {
    alert("Please enter a valid location!");
    const message = [
      "Please enter location with commas as separators!",
      "City Name, State Code, Country Code* ||",
      "Zip Code, Country Code* ||",
      "Latitude, Longitude",
      "*optional, US default, Please use ISO 3166 country codes.",
    ];
    for (let i = 0; i < message.length; i++) {
      let p = document.createElement("p");
      p.textContent = message[i];
      alertDiv.appendChild(p);
      output.appendChild(alertDiv);
    }
  } else {
    const message = document.createElement("p");
    message.textContent = `${err.cod} ${err.message}`;
    message.classList.add("input-alert");
    output.appendChild(message);
  }
}

// validates form input and forwards to appropriate geolocation URL creator
function validateLocationForm(search) {
  const arr = search.value.split(",");
  // US default if no country code provided
  if (arr.length === 2) {
    arr.push("USA");
  }
  geocoderDirect(arr);
}
function validateZipForm(search) {
  const temp = search.value.split(",");
  const arr = [];
  // remove spaces from string before creating array
  for (let i = 0; i < temp.length; i++) {
    const str = temp[i].replace(/ /g, "");
    arr.push(str);
  }
  // fix common country code error
  if (arr[1] === "USA") {
    arr.pop();
    arr.push("US");
  }
  // US default if no country code provided
  if (arr.length === 1) {
    arr.push("US");
  }
  geocoderZip(arr);
}
function validateGeoForm(search) {
  const temp = search.value.split(",");
  const arr = [];
  // remove spaces from string before creating array
  for (let i = 0; i < temp.length; i++) {
    const str = temp[i].replace(/ /g, "");
    arr.push(str);
  }
  geocoderReverse(arr);
}

// creates URL for geolocation API call
function geocoderDirect(arr) {
  const query = arr.toString();
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&appid=e768023fab961408a046720d11f66181`;
  getLocation(url);
}
function geocoderZip(arr) {
  const query = arr.toString();
  const url = `https://api.openweathermap.org/geo/1.0/zip?zip=${query}&appid=e768023fab961408a046720d11f66181`;
  getLocation(url);
}
function geocoderReverse(arr) {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${arr[0]}&lon=${arr[1]}&appid=e768023fab961408a046720d11f66181`;
  getLocation(url);
}

// Open Weather Geocoding API call
async function getLocation(url) {
  try {
    const response = await fetch(url, {
      mode: "cors",
    });
    const locationData = await response.json();
    validateLocationData(locationData);
  } catch (error) {
    alert(error);
    inputAlert(error);
  }
}

// check location API data for input errors
function validateLocationData(data) {
  if (data.cod === "404" || data.cod === "400" || data.cod === "") {
    alert(`Invalid input:  ${data.message}`);
    clearDOM();
    inputAlert(data);
  } else {
    parseLocationData(data);
  }
}

// location object to smooth transition from Geocoding API > One Call API call
class Location {
  constructor(lat, lon, name) {
    this.lat = lat;
    this.lon = lon;
    this.name = name;
  }
}

// parses geolocation API return and sends Location object for weather URL creation
function parseLocationData(data) {
  if (Array.isArray(data)) {
    const geolocation = new Location(data[0].lat, data[0].lon, data[0].name);
    checkUnitsToggle(geolocation);
  } else {
    const geolocation = new Location(data.lat, data.lon, data.name);
    checkUnitsToggle(geolocation);
  }
}

// checks toggle status and appends appropriate settings to Location object
function checkUnitsToggle(data) {
  if (toggle.checked === false) {
    data.units = "imperial";
    oneCallURL(data);
  } else {
    data.units = "metric";
    oneCallURL(data);
  }
}

// creates URL for One Call API weather call
function oneCallURL(data) {
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&exclude=hourly,minutely&units=${data.units}&appid=e768023fab961408a046720d11f66181`;
  locationBanner(data);
  getWeather(url);
}

// appends location name to DOM
function locationBanner(data) {
  const location = document.createElement("h2");
  location.textContent = data.name;
  clearDOM();
  output.appendChild(location);
}

// Open Weather One Call API
async function getWeather(url) {
  try {
    const response = await fetch(url, {
      mode: "cors",
    });
    const weatherData = await response.json();
    weatherAlertChecker(weatherData);
  } catch (error) {
    alert(error);
    inputAlert(error);
  }
}

// checks toggle status for appropriate wind speed annotation
function windSpeed() {
  if (toggle.checked === false) {
    return "mph";
  } else {
    return "km/h";
  }
}

// translates wind degree data to directional descriptor
function windDirection(data) {
  if (data.current.wind_deg > 337.5) return "N";
  if (data.current.wind_deg > 292.5) return "NW";
  if (data.current.wind_deg > 247.5) return "W";
  if (data.current.wind_deg > 202.5) return "SW";
  if (data.current.wind_deg > 157.5) return "S";
  if (data.current.wind_deg > 122.5) return "SE";
  if (data.current.wind_deg > 67.5) return "E";
  if (data.current.wind_deg > 22.5) {
    return "NE";
  }
  return "N";
}

function weatherAlertChecker(data) {
  if (!data.alerts) {
    renderCurrent(data);
  } else {
    for (let i = 0; i < data.alerts.length; i++) {
      const alert = document.createElement("h3");
      alert.classList.add("weather-alert");
      alert.textContent = data.alerts[i].event;
      output.appendChild(alert);
    }
    renderCurrent(data);
  }
}

// renders current weather info to DOM
function renderCurrent(data) {
  const current = document.createElement("div");
  current.classList.add("current");
  const description = document.createElement("h3");
  description.textContent = data.current.weather[0].description;
  current.appendChild(description);
  const icon = `https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`;
  const img = document.createElement("img");
  img.src = icon;
  current.appendChild(img);
  const list = document.createElement("ul");
  list.classList.add("weather-stats");
  const stats = [
    `Currently ${parseInt(data.current.temp)}°`,
    `Feels like ${parseInt(data.current.feels_like)}°`,
    `Min ${parseInt(data.daily[0].temp.min)}°`,
    `Max ${parseInt(data.daily[0].temp.max)}°`,
    `Humidity ${parseInt(data.current.humidity)}%`,
    `Wind ${parseInt(data.current.wind_speed)} ${windSpeed()} ${windDirection(
      data
    )}`,
    `Gust ${parseInt(data.current.wind_gust)} ${windSpeed()}`,
  ];
  if (!data.current.wind_gust) {
    stats.pop();
  }
  stats.forEach(function (stat) {
    let li = document.createElement("li");
    li.textContent = stat;
    list.appendChild(li);
  });
  current.appendChild(list);
  output.appendChild(current);
  renderForecast(data);
}

// renders forecast to DOM
function renderForecast(data) {
  const forecast = document.createElement("div");
  forecast.classList.add("forecast");
  for (let i = 1; i < data.daily.length; i++) {
    const daily = document.createElement("div");
    daily.classList.add("daily");
    // find and append day of week
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayNum = new Date(data.daily[i].dt * 1000).getDay();
    const dayName = document.createElement("span");
    dayName.textContent = days[dayNum];
    daily.appendChild(dayName);
    // append weather icon
    const icon = `https://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}.png`;
    const img = document.createElement("img");
    img.src = icon;
    daily.appendChild(img);
    // append short descriptor, min temp, max temp
    const description = document.createElement("span");
    description.textContent = data.daily[i].weather[0].main;
    const min = document.createElement("span");
    min.classList.add("forecast-temp-min");
    min.textContent = `${parseInt(data.daily[i].temp.min)}°`;
    const max = document.createElement("span");
    max.classList.add("forecast-temp-max");
    max.textContent = `${parseInt(data.daily[i].temp.max)}°`;
    daily.appendChild(description);
    daily.appendChild(max);
    daily.appendChild(min);
    forecast.appendChild(daily);
  }
  output.appendChild(forecast);
}
