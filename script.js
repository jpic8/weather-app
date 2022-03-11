const locationInput = document.querySelector("#location-name");
const zipInput = document.querySelector("#zipcode");
const geoInput = document.querySelector("#lat-lon");

const locationSearch = document.querySelector("#location-name-search");
const zipSearch = document.querySelector("#zipcode-search");
const geoSearch = document.querySelector("#lat-lon-search");

const output = document.querySelector(".output");

locationSearch.onclick = () => validateLocationForm(locationInput);
zipSearch.onclick = () => validateZipForm(zipInput);
geoSearch.onclick = () => validateGeoForm(geoInput);

function validateLocationForm(search) {
  if (search.value === undefined || search.value === "") {
    alert("Please enter {city}, {state}, {country} COMMAS REQUIRED");
  } else {
    const arr = search.value.split(",");
    if (arr.length === 2) {
      arr.push("USA");
    }
    // console.log(arr);
    // newLocationURL(arr);
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
    // newZipURL(arr);
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
    // newGeoURL(arr);
    // oneCallURL(arr);
    geocoderReverse(arr);
  }
}

function geocoderDirect(arr) {
  const query = arr.toString();
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&appid=e768023fab961408a046720d11f66181`;
  console.log(url);
  getLocation(url);
}

function geocoderZip(arr) {
  const query = arr.toString();
  const url = `http://api.openweathermap.org/geo/1.0/zip?zip=${query}&appid=e768023fab961408a046720d11f66181`;
  console.log(url);
  getLocation(url);
}

function geocoderReverse(arr) {
  const query = arr.toString();
  const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${arr[0]}&lon=${arr[1]}&appid=e768023fab961408a046720d11f66181`;
  console.log(url);
  getLocation(url);
}

function oneCallURL(arr) {
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${arr[0]}&lon=${arr[1]}&exclude=hourly,minutely&units=imperial&appid=e768023fab961408a046720d11f66181`;
  console.log(url);
  getWeather(url);
}

async function getLocation(url) {
  try {
    const response = await fetch(url, {
      mode: "cors",
    });
    const locationData = await response.json();
    console.log(locationData);
    // processJSON(weatherData);
  } catch (error) {
    alert(error);
  }
}

async function getWeather(url) {
  try {
    const response = await fetch(url, {
      mode: "cors",
    });
    const weatherData = await response.json();
    console.log(weatherData);
    // processJSON(weatherData);
  } catch (error) {
    alert(error);
  }
}

class Forecast {
  constructor(
    name,
    description,
    feels_like,
    humidity,
    temp,
    temp_min,
    temp_max,
    lat,
    lon
  ) {
    this.name = name;
    this.description = description;
    this.feels_like = feels_like;
    this.humidity = humidity;
    this.temp = temp;
    this.temp_min = temp_min;
    this.temp_max = temp_max;
    this.lat = lat;
    this.lon = lon;
  }
}

function processJSON(weatherData) {
  const today = new Forecast(
    weatherData.name,
    weatherData.weather[0].description,
    weatherData.main.feels_like,
    weatherData.main.humidity,
    weatherData.main.temp,
    weatherData.main.temp_min,
    weatherData.main.temp_max,
    weatherData.coord.lat,
    weatherData.coord.lon
  );
  console.log(today);
}

// function newLocationURL(arr) {
//   const query = arr.toString();
//   const url = `http://api.openweathermap.org/data/2.5/weather?q=${query}&units=imperial&appid=e768023fab961408a046720d11f66181`;
//   console.log(url);
//   getWeather(url);
// }

// function newZipURL(arr) {
//   const query = arr.toString();
//   const url = `https://api.openweathermap.org/data/2.5/weather?zip=${query}&units=imperial&appid=e768023fab961408a046720d11f66181`;
//   console.log(url);
//   getWeather(url);
// }

// function newGeoURL(arr) {
//   const url = `http://api.openweathermap.org/data/2.5/weather?lat=${arr[0]}&lon=${arr[1]}&units=imperial&appid=e768023fab961408a046720d11f66181`;
//   console.log(url);
//   getWeather(url);
// }
