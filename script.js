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
    alert("Please enter {city}, {state}, {country}");
  } else {
    const temp = search.value;
    const location = temp.replace(/ /g, "");
    newLocationURL(location);
  }
}

function validateZipForm(search) {
  if (search.value === undefined || search.value === "") {
    alert("Please enter {zipcode}, {country code}");
  } else {
    const temp = search.value;
    const location = temp.replace(/,/g, "");
    const arr = location.split(" ");
    newZipURL(arr);
  }
}

function validateGeoForm(search) {
  if (search.value === undefined || search.value === "") {
    alert("Please enter {latitude}, {longitude}");
  } else {
    const temp = search.value;
    const location = temp.replace(/,/g, "");
    const arr = location.split(" ");
    newGeoURL(arr);
  }
}

function newLocationURL(location) {
  const address = "http://api.openweathermap.org/data/2.5/weather?q=";
  const api = "&units=imperial&appid=e768023fab961408a046720d11f66181";
  const url = address + location + api;
  getWeather(url);
}

function newZipURL(arr) {
  if (arr.length === 1) {
    arr.push("US");
  }
  const address = "http://api.openweathermap.org/geo/1.0/zip?zip=";
  const query = `${arr[0]},${arr[1]}`;
  const api = "&appid=e768023fab961408a046720d11f66181";
  const url = address + query + api;
  console.log(url);
  getWeather(url);
}

function newGeoURL(arr) {
  const address = "http://api.openweathermap.org/geo/1.0/reverse?lat=";
  const query = `${arr[0]}&lon=${arr[1]}`;
  const api = "&appid=e768023fab961408a046720d11f66181";
  const url = address + query + api;
  console.log(url);
  getWeather(url);
}

async function getWeather(url) {
  try {
    const response = await fetch(url, {
      mode: "cors",
    });
    const weatherData = await response.json();
    console.log(weatherData);
    render(weatherData);
  } catch (error) {
    alert(error);
  }
}

function render(weatherData) {
  const forecast = document.createElement("div");
  forecast.classList.add("forecast");
  const today = document.createTextNode(
    `${weatherData.name}, 
    ${weatherData.main.temp} degrees, 
    ${weatherData.main.humidity}% humidity,
    ${weatherData.weather[0].description}`
  );
  forecast.appendChild(today);
  output.appendChild(forecast);
}

// async function getWeather() {
//   try {
//     const response = await fetch(
//       "http://api.openweathermap.org/data/2.5/weather?q=Denver,CO,USA&appid=e768023fab961408a046720d11f66181",
//       {
//         mode: "cors",
//       }
//     );
//     const weatherData = await response.json();
//     console.log(weatherData);
//   } catch (error) {
//     alert(error);
//   }
// }
