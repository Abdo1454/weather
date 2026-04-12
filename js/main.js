let locationInput = document.getElementById("city-input");
let searchButton = document.getElementById("search-btn");

// عناصر العرض
let cityName = document.getElementById("city-name");
let temperature = document.getElementById("temperature");
let description = document.getElementById("description");
let humidity = document.getElementById("humidity");
let windSpeed = document.getElementById("wind-speed");
let pressure = document.getElementById("pressure");
let weatherResult = document.querySelector(".weather-result");
let hoursDaily = document.getElementById("hours-daily");
let forecastContainer = document.querySelector(".forecast-container");
let noResult = document.getElementById("no-result");
let wrongResult = document.getElementById("wrong-result");

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
    const { latitude, longitude, name } = await getCoordinates(city);

const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,pressure_msl,temperature_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;    const res = await fetch(url);
    const data = await res.json();

    displayWeather(name, data);
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
function displayWeather(city, data) {
  const current = data.current_weather;

  cityName.textContent = city;
  temperature.textContent = `${current.temperature}°C`;

  description.textContent = getWeatherDescription(current.weathercode);
  windSpeed.textContent = `${current.windspeed} km/h`;

  // ✔️ استخدم أول عنصر مباشرة (أكثر استقرارًا)
  const humidityValue = data.hourly?.relativehumidity_2m?.[0];
  const pressureValue = data.hourly?.pressure_msl?.[0];

  humidity.textContent =
    humidityValue !== undefined ? `${humidityValue}%` : "N/A";
  pressure.textContent =
    pressureValue !== undefined ? `${pressureValue} hPa` : "N/A";
if (data.hourly?.time) {
  hoursDaily.innerHTML = "";

  for (let i = 0; i < Math.min(12, data.hourly.time.length); i++) {
    const time = data.hourly.time[i];
    const temp = data.hourly.temperature_2m[i];

    if (time && temp !== undefined) {
      hoursDaily.innerHTML += `<li>${time.split("T")[1]}   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${temp}°C</li>`;
    }
  }
}
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

// 🌥 mapping weather code
function getWeatherDescription(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    61: "Rain",
    71: "Snow",
    80: "Rain showers",
  };

  return map[code] || "Unknown";
}
