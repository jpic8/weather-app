"use strict";

// new object classes
class Location {
  constructor(lat, lon, name) {
    this.lat = lat;
    this.lon = lon;
    this.name = name;
  }
}

class Forecast {
  constructor(description, icon, feels_like, temp, humidity, wind_speed) {
    this.description = description;
    this.icon = icon;
    this.feels_like = feels_like;
    this.temp = temp;
    this.humidity = humidity;
    this.wind_speed = wind_speed;
  }
}

// DOM elements
const locationInput = document.querySelector("#location-name");
const zipInput = document.querySelector("#zipcode");
const geoInput = document.querySelector("#lat-lon");
const locationSearch = document.querySelector("#location-name-search");
const zipSearch = document.querySelector("#zipcode-search");
const geoSearch = document.querySelector("#lat-lon-search");
const output = document.querySelector(".output");

// event listeners
locationSearch.onclick = () => validateInput(locationInput);
zipSearch.onclick = () => validateZipForm(zipInput);
geoSearch.onclick = () => validateGeoForm(geoInput);

// utility functions
function clearDOM() {
  while (output.firstChild) {
    output.removeChild(output.firstChild);
  }
}

// processes any input errors and appends to alert message to DOM
function inputAlert(err) {
  clearDOM();
  if (err === undefined || err.cod === "") {
    alert("Please enter a valid location!");
    const message = [
      "Please enter location with commas as separators!",
      "City, State, Country-optional, US default",
      "Zipcode, Country-optional, US default",
      "Latitude, Longitude",
      "Please use ISO 3166 country codes.",
    ];
    for (i = 0; i < message.length; i++) {
      let p = document.createElement("p");
      p.classList.add("input-alert");
      p.textContent = message[i];
      output.appendChild(p);
    }
  } else {
    const message = document.createElement("p");
    message.textContent = `${err.cod} ${err.message}`;
    message.classList.add("input-alert");
    output.appendChild(message);
  }
}

// validates user input and directs to appropriate geolocation path
function validateInput(search) {
  if (search.value === undefined || search.value === "") {
    inputAlert();
  } else {
    const inspect = search.value.split("");
    if (isNaN(inspect[0]) && inspect[0] !== "-") {
      console.log("might be a city name");
    } else if (search.value.includes(".") || search.value.includes("-")) {
      console.log("maybe GPS coordinates!");
    } else {
      console.log("zipcode baby");
    }
  }
}

// validates form input and forwards to appropriate geolcation URL creator
function validateLocationForm(search) {
  const arr = search.value.split(",");
  // US default if no country code provided
  if (arr.length === 2) {
    arr.push("USA");
  }
  // console.log(arr);
  geocoderDirect(arr);
}
function validateZipForm(search) {
  const temp = search.value.split(",");
  const arr = [];
  // remove spaces from string before creating new array
  for (let i = 0; i < temp.length; i++) {
    const str = temp[i].replace(/ /g, "");
    arr.push(str);
  }
  // fix common error
  if (arr[1] === "USA") {
    arr.pop();
    arr.push("US");
  }
  // US default if no country code provided
  if (arr.length === 1) {
    arr.push("US");
  }
  // console.log(arr);
  geocoderZip(arr);
}
function validateGeoForm(search) {
  const temp = search.value.split(",");
  const arr = [];
  // remove spaces from string before creating new array
  for (let i = 0; i < temp.length; i++) {
    const str = temp[i].replace(/ /g, "");
    arr.push(str);
  }
  // console.log(arr);
  geocoderReverse(arr);
}

// creates URL for geolocation API call
function geocoderDirect(arr) {
  const query = arr.toString();
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&appid=e768023fab961408a046720d11f66181`;
  // console.log(url);
  getLocation(url);
}
function geocoderZip(arr) {
  const query = arr.toString();
  const url = `http://api.openweathermap.org/geo/1.0/zip?zip=${query}&appid=e768023fab961408a046720d11f66181`;
  // console.log(url);
  getLocation(url);
}
function geocoderReverse(arr) {
  const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${arr[0]}&lon=${arr[1]}&appid=e768023fab961408a046720d11f66181`;
  // console.log(url);
  getLocation(url);
}

// Open Weather Geocoding API call
async function getLocation(url) {
  try {
    const response = await fetch(url, {
      mode: "cors",
    });
    const locationData = await response.json();
    // console.log(locationData);
    validateLocationData(locationData);
  } catch (error) {
    alert(error);
  }
}

// check location API data for input errors
function validateLocationData(data) {
  if (data.cod === "404" || data.cod === "400" || data.cod === "") {
    console.log("doh!");
    alert(`Invalid input:  ${data.message}`);
    clearDOM();
    inputAlert(data);
  } else {
    parseLocationData(data);
  }
}

// parses geolocation API return and sends object for weather URL creation
function parseLocationData(data) {
  if (Array.isArray(data)) {
    const geolocation = new Location(data[0].lat, data[0].lon, data[0].name);
    oneCallURL(geolocation);
  } else {
    const geolocation = new Location(data.lat, data.lon, data.name);
    oneCallURL(geolocation);
  }
}

// creates URL for One Call API weather call and appends location name to DOM
function oneCallURL(data) {
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&exclude=hourly,minutely&units=imperial&appid=e768023fab961408a046720d11f66181`;
  const location = document.createElement("h2");
  location.textContent = data.name;
  // clear output div before appending
  clearDOM();
  output.appendChild(location);
  getWeather(url);
}

// Open Weather One Call API
async function getWeather(url) {
  try {
    const response = await fetch(url, {
      mode: "cors",
    });
    const weatherData = await response.json();
    console.log(weatherData);
    // parseCurrentData(weatherData);
    // render(weatherData);
  } catch (error) {
    alert(error);
  }
}

// parse wanted information from One Call API object return
function parseCurrentData(data) {
  const today = new Forecast(
    data.current.weather[0].description,
    data.current.weather[0].icon,
    data.current.feels_like,
    data.current.temp,
    data.current.humidity,
    data.current.wind_speed
  );
  console.log(today);
  // renderCurrent(today);
}

function render(data) {
  const currentArr = [];
  for (let entree of Object.entries(data.current)) {
    currentArr.push(entree);
  }
  console.log(currentArr);
  const dailyArr = [];
  const weeklyArr = [];
  for (let i = 0; i < data.daily.length; i++) {
    for (let entree of Object.entries(data.daily[i])) {
      dailyArr.push(entree);
    }
  }
  console.log(dailyArr);
}

// renders current weather info to DOM
function renderCurrent(data) {
  const current = document.createElement("div");
  current.classList.add("current");

  const icon = `http://openweathermap.org/img/wn/${today.icon}@2x.png`;
  const img = document.createElement("img");
  img.src = icon;
  current.appendChild(img);
  const description = document.createElement("h3");
  description.textContent = today.description;
  current.appendChild(description);
  const stats = document.createElement("ul");
  stats.classList.add("stats");
  const feelsLike = document.createElement("li");
  feelsLike.classList.add("feels-like");
  feelsLike.textContent = parseInt(today.feels_like);
  stats.appendChild(feelsLike);
  const temp = document.createElement("li");
  temp.classList.add("temp");
  temp.textContent = parseInt(today.temp);
  stats.appendChild(temp);
  const humidity = document.createElement("li");
  humidity.classList.add("humidity");
  humidity.textContent = parseInt(today.humidity);
  stats.appendChild(humidity);
  const windSpeed = document.createElement("li");
  windSpeed.classList.add("wind-speed");
  windSpeed.textContent = parseInt(today.wind_speed);
  stats.appendChild(windSpeed);

  current.appendChild(stats);
  output.appendChild(current);
}
