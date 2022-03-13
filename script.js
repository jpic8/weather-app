// new object classes
class Location {
  constructor(lat, lon, name) {
    this.lat = lat;
    this.lon = lon;
    this.name = name;
  }
}

class Current {
  constructor(description, icon, feels_like, temp, humidity, wind_speed) {
    this.description = description;
    this.icon = icon;
    this.feels_like = feels_like;
    this.temp = temp;
    this.humidity = humidity;
    this.wind_speed = wind_speed;
  }
}

class Daily {
  constructor(
    description,
    icon,
    feels_like,
    temp,
    temp_min,
    temp_max,
    humidity
  ) {
    this.description = description;
    this.icon = icon;
    this.feels_like = feels_like;
    this.temp = temp;
    this.temp_min = temp_min;
    this.temp_max = temp_max;
    this.humidity = humidity;
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

function validateInput(search) {
  const inspect = search.value.split("");
  if (isNaN(inspect[0])) {
    console.log("might be a city name");
  } else if (search.value.includes(".") || search.value.includes("-")) {
    console.log("maybe GPS coordinates!");
  } else {
    console.log("zipcode baby");
  }
}

// validates form input and forwards to geolcation URL creator
function validateLocationForm(search) {
  if (search.value === undefined || search.value === "") {
    alert("Please enter {city}, {state}, {country} COMMAS REQUIRED");
  } else {
    const arr = search.value.split(",");
    if (arr.length === 2) {
      arr.push("USA");
    }
    // console.log(arr);
    geocoderDirect(arr);
  }
}
function validateZipForm(search) {
  if (search.value === undefined || search.value === "") {
    alert("Please enter {zipcode}, {country code}(optional, US default)");
  } else {
    const temp = search.value.split(",");
    const arr = [];
    for (i = 0; i < temp.length; i++) {
      const str = temp[i].replace(/ /g, "");
      arr.push(str);
    }
    if (arr.length === 1) {
      arr.push("US");
    }
    // console.log(arr);
    geocoderZip(arr);
  }
}
function validateGeoForm(search) {
  if (search.value === undefined || search.value === "") {
    alert("Please enter {latitude}, {longitude}");
  } else {
    const temp = search.value.split(",");
    const arr = [];
    for (i = 0; i < temp.length; i++) {
      const str = temp[i].replace(/ /g, "");
      arr.push(str);
    }
    // console.log(arr);
    geocoderReverse(arr);
  }
}

// creates URL for geolocation API call
function geocoderDirect(arr) {
  const query = arr.toString();
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&appid=e768023fab961408a046720d11f66181`;
  console.log(url);
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

// geolocation API call
async function getLocation(url) {
  try {
    const response = await fetch(url, {
      mode: "cors",
    });
    const locationData = await response.json();
    // parseLocationData(locationData);
    console.log(locationData);
    validateLocationData(locationData);
  } catch (error) {
    alert(error);
  }
}

// checks API data for input errors
function validateLocationData(data) {
  if (data.cod === "404" || data.cod === "400" || data.cod === "") {
    console.log("doh!");
    alert(`Invalid input:  ${data.message}`);
    clearDOM();
  } else {
    parseLocationData(data);
  }
}

// parses geolocation API return and sends new object for weather URL creation
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

// One Call API call for weather data
async function getWeather(url) {
  try {
    const response = await fetch(url, {
      mode: "cors",
    });
    const weatherData = await response.json();
    console.log(weatherData);
    parseCurrentData(weatherData);
  } catch (error) {
    alert(error);
  }
}

// parse wanted information from current data section of One Call API
function parseCurrentData(data) {
  const today = new Current(
    data.current.weather[0].description,
    data.current.weather[0].icon,
    data.current.feels_like,
    data.current.temp,
    data.current.humidity,
    data.current.wind_speed
  );
  console.log(today);
  renderCurrent(today);
}

// renders current weather info to DOM
function renderCurrent(today) {
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
