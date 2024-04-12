const CURRENT_WEATHER_API_URL =
  "https://api.openweathermap.org/data/2.5/weather?units=metric";
const WEEK_WEATHER_API_URL =
  "https://api.openweathermap.org/data/2.5/forecast?units=metric";
const GET_LOCATION_CITY =
  "https://api.openweathermap.org/geo/1.0/reverse?limit=1";
const API_KEY = "25d3d20e662a97750adc081ed3de752d";

const weekDays = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

const getWeatherIconUrl = (code) => {
  return `https://openweathermap.org/img/wn/${code}@2x.png`;
};

const fillInWeatherTable = (data) => {
  let table = document.getElementById("weatherTable");

  const addCell = (tr, content) => {
    var td = tr.insertCell();
    if (typeof content === "object") {
      td.appendChild(content);
    } else {
      td.innerHTML = content;
    }

    return td;
  };

  data.forEach((item) => {
    const iconElement = document.createElement("img");
    iconElement.src = getWeatherIconUrl(item.weather[0].icon);
    iconElement.classList.add("week-weather-icon");
    let row = table.insertRow();
    addCell(row, weekDays[new Date(item.dt_txt).getDay()]);
    addCell(row, iconElement);
    addCell(row, item.weather[0].description);
    addCell(row, `${Math.round(item.main.temp)}°C`);
  });
};

const getCurrentWeather = (city) => {
  fetch(CURRENT_WEATHER_API_URL + `&appid=${API_KEY}&q=${city}`)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("weatherInfoLoader").style.display = "none";
      if (data.cod == 404) {
        document.querySelector(".weather-info-wrapper").style.display = "none";
        document.querySelector(".error-message").style.display = "block";
        document.querySelector(".error-message-title").innerHTML =
          "Invalid city name! Try Again";
        return;
      }
      document.getElementById("weatherInfoLoader").style.display = "none";
      document.querySelector(".weather-info-wrapper").style.display = "block";

      document.getElementById("city").innerHTML = data.name;
      document.getElementById("temperature").innerHTML = `${Math.round(
        data.main.temp
      )}°C`;
      document.getElementById("feelsLike").innerHTML = `${Math.round(
        data.main.feels_like
      )}°C`;
      document.getElementById("humidity").innerHTML = `${data.main.humidity}%`;
      document.getElementById("wind").innerHTML = `${data.wind.speed}km/h`;
      document.getElementById("weatherIcon").src = getWeatherIconUrl(
        data.weather[0].icon
      );
    })
    .catch((error) => {
      document.querySelector(".weather-info-wrapper").style.display = "none";
      document.querySelector(".error-message").style.display = "block";
      document.querySelector(".error-message-title").innerHTML =
        "Something went wrong...";
    });
};

const getWeekWeather = (city) => {
  fetch(WEEK_WEATHER_API_URL + `&appid=${API_KEY}&q=${city}`)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("weatherInfoLoader").style.display = "none";
      if (data.cod == 404) {
        document.querySelector(".weather-info-wrapper").style.display = "none";
        document.querySelector(".error-message").style.display = "block";
        document.querySelector(".error-message-title").innerHTML =
          "Invalid city name! Try Again";
        return;
      }

      document.getElementById("weatherInfoLoader").style.display = "none";
      document.querySelector(".weather-info-wrapper").style.display = "block";

      let filteredData = data.list.filter(
        (el) => new Date(el.dt_txt).getHours() === 15
      );

      fillInWeatherTable(filteredData);
    })
    .catch((error) => {
      document.querySelector(".weather-info-wrapper").style.display = "none";
      document.querySelector(".error-message").style.display = "block";
      document.querySelector(".error-message-title").innerHTML =
        "Something went wrong...";
    });
};

window.addEventListener("DOMContentLoaded", (event) => {
  const searchField = document.getElementById("cityName");
  const searchButton = document.getElementById("cityButton");

  if (navigator.geolocation) {
    document.getElementById("defaultImage").style.display = "none";
    document.getElementById("weatherInfoLoader").style.display = "block";
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }

  function successFunction(position) {
    getLocationCity(position.coords.latitude, position.coords.longitude);
  }

  function errorFunction() {
    document.getElementById("defaultImage").style.display = "block";
    document.getElementById("weatherInfoLoader").style.display = "none";
  }

  const getLocationCity = (lat, lon) => {
    fetch(GET_LOCATION_CITY + `&appid=${API_KEY}&lat=${lat}&lon=${lon}`)
      .then((res) => res.json())
      .then((data) => {
        getCurrentWeather(data[0].name);
        getWeekWeather(data[0].name);
      })
      .catch((error) => {
        document.querySelector(".weather-info-wrapper").style.display = "none";
        document.querySelector(".error-message").style.display = "block";
        document.querySelector(".error-message-title").innerHTML =
          "Something went wrong...";
      });
  };

  searchButton.addEventListener("click", () => {
    if (searchField.value) {
      document.querySelector(".weather-info-wrapper").style.display = "none";
      document.querySelector(".error-message").style.display = "none";
      document.getElementById("defaultImage").style.display = "none";
      document.getElementById("weatherTable").innerHTML = "";
      document.getElementById("weatherInfoLoader").style.display = "block";
      getCurrentWeather(searchField.value);
      getWeekWeather(searchField.value);
    }
  });
});
