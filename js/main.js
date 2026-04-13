let locationInput = document.getElementById("city-input");
let searchButton = document.getElementById("search-btn");
let daySelect = document.getElementById("day-select");

// عناصر العرض
let cityName = document.getElementById("city-name");
let dataCountry = document.getElementById("data-country");
let temperature = document.getElementById("temperature");
let feelsLike = document.getElementById("feels-like");
let statue = document.getElementById("statue");
let description = document.getElementById("description");
let humidity = document.getElementById("humidity");
let windSpeed = document.getElementById("wind-speed");
let pressure = document.getElementById("pressure");
let weatherResult = document.querySelector(".weather-result");
// let dayElement = document.getElementById("day");
let hoursDaily = document.getElementById("hours-daily");
let forecastContainer = document.querySelector(".forecast-container");
let noResult = document.getElementById("no-result");
let wrongResult = document.getElementById("wrong-result");

// 🔥 تخزين الداتا عالميًا
let weatherData = null;
// زر البحث
searchButton.addEventListener("click", () => {
  const city = locationInput.value.trim();

  if (city === "") {
    wrongResult.classList.remove("hidden");
    weatherResult.classList.add("hidden");
    noResult.classList.add("hidden");
  } else {
    fetchWeather(city);
  }
});

// Enter key
locationInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchButton.click();
  }
});
// Select change
// احسب اليوم الحالي (0 = الأحد، 1 = الاثنين، ...، 6 = السبت)
const today = new Date();
const todayDay = today.getDay();

// إذا عايز تبدأ من اليوم الحالي، خلي select على القيمة الحالية
if (daySelect) {
  daySelect.value = todayDay;
}

// باقي الكود زي ما هو
daySelect.addEventListener("change", () => {
  if (weatherData) {
    displayHourly(weatherData);
  }
});
// 🧭 1. Geocoding
async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
 const res = await fetch(url);
const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }

  return data.results[0];
}

// 🌤 2. Weather
async function fetchWeather(city) {
  try {
    const { latitude, longitude, name, country } = await getCoordinates(city);

const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,pressure_msl,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;  
const res = await fetch(url); 
const data = await res.json();

    weatherData = data; // 🔥 مهم جدًا
    displayWeather(name, country, data);
  } catch (error) {
    console.error(error);

    weatherResult.classList.add("hidden");

    if (error.message === "City not found") {
      noResult.classList.remove("hidden");
    } else {
      alert(error.message);
    }
  }
}

// 🖥 3. Display
function displayWeather(city, country, data) {
  const current = data.current_weather;
  const time = data.daily.time[0];
   const date = new Date(time);
   const dayName = date.toLocaleDateString("en-US", {
      weekday: "long",
    });
  cityName.textContent = `${city}, ${country}`;
  dataCountry.textContent = `${dayName}, ${time}`;
  feelsLike.textContent = `${current.temperature}°C`;
  temperature.textContent = `${current.temperature}°C`;
  statue.innerHTML =   `<img  class="weather-icon11" src="${getWeatherDescription(current.weathercode)}" alt="Weather Icon">`;
  windSpeed.textContent = `${current.windspeed} km/h`;

  // ✔️ استخدم أول عنصر مباشرة (أكثر استقرارًا)
  const humidityValue = data.hourly?.relativehumidity_2m?.[0];
  const pressureValue = data.hourly?.pressure_msl?.[0];

  humidity.textContent =
    humidityValue !== undefined ? `${humidityValue}%` : "N/A";
  pressure.textContent =
    pressureValue !== undefined ? `${pressureValue} hPa` : "N/A";

  displayHourly(data);

if (data.daily?.time) {
  let html = "";

  for (let i = 0; i < Math.min(7, data.daily.time.length); i++) {
    const time = data.daily.time[i];
    const max = data.daily.temperature_2m_max[i];
    const min = data.daily.temperature_2m_min[i];
    const date = new Date(time);
    const dayName = date.toLocaleDateString("en-US", {
      weekday: "long",
    });
    html += `
      <div class="forecast-item">
        <div class="forecast-date">${dayName}</div>
        <img class="forecast-icon111" src="${getWeatherDescription(data.daily.weathercode[i])}" alt="Weather Icon">
        <div class="forecast-temp"> <span>${max}°</span> &nbsp;&nbsp; <span>${min}°</span></div>
      </div>
    `;
  }

  forecastContainer.innerHTML = html;
}
  weatherResult.classList.remove("hidden");
  noResult.classList.add("hidden");
  wrongResult.classList.add("hidden");
}
// 🕒 Hourly forecast
function displayHourly(data) {
  if (!data.hourly?.time) return;

  const selectedDay = Number(daySelect?.value || 0);

  let html = "";

  const start = selectedDay * 24;
  const end = start + 24;
  const max = data.hourly.time.length;

  for (let i = start; i < Math.min(end, max); i++) {
    const time = data.hourly.time[i];
    const temp = data.hourly.temperature_2m[i];
    const code = data.hourly.weathercode[i];

    if (time && temp !== undefined) {
      const cleanTime = time.split("T")[1].slice(0, 5);

      html += `
        <li class="hour-item">
          <span class="hour">
            <img src="${getWeatherDescription(code)}" class="forecast-icon111" alt="Weather Icon">
            ${cleanTime}
          </span>
          <span class="temp">${temp}°C</span>
        </li>
      `;
    }
  }

  hoursDaily.innerHTML = html;
}
// 🌥 mapping weather code
function getWeatherDescription(code) {
  const map = {
    0: "../assets/images/icon-sunny.webp",
    1: "../assets/images/icon-partly-cloudy.webp",
    2: "../assets/images/icon-partly-cloudy.webp",
    3: "../assets/images/icon-overcast.webp",
    45: "../assets/images/icon-fog.webp",
    48: "../assets/images/icon-fog.webp",
    51: "../assets/images/icon-drizzle.webp",
    61: "../assets/images/icon-rain.webp",
    71: "../assets/images/icon-snow.webp",
    80: "../assets/images/icon-showers.webp",
  };

  return map[code] || "../assets/images/icon-unknown.webp";
}
