let locationInput = document.getElementById("city-input");
let searchButton = document.getElementById("search-btn");

// عناصر العرض
let cityName = document.getElementById("city-name");
let temperature = document.getElementById("temperature");
let weatherDetails = document.querySelector(".weather-details");
let description = document.getElementById("description");
let humidity = document.getElementById("humidity");
let windSpeed = document.getElementById("wind-speed");
let pressure = document.getElementById("pressure");
let noResult = document.getElementById("no-result");
// 🔘 لما المستخدم يضغط Search
searchButton.addEventListener("click", () => {
  const city = locationInput.value.trim();

  if (city === "") {
    alert("Please enter a city name.");
  } else {
    fetchWeather(city);
  }
});

// 🧭 1. نجيب الإحداثيات
async function getCityCoordinates(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
  const res = await fetch(geoUrl);
  const data = await res.json();

  if (!data.results) {
    throw new Error("City not found");
  }

  return data.results[0];
}

// 🌤 2. نجيب الطقس
async function fetchWeather(city) {
  try {
    const { latitude, longitude, name } = await getCityCoordinates(city);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    displayWeather(name, data);

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}
// 🖥 3. عرض البيانات في الصفحة
function displayWeather(city, data) {
  const current = data.current_weather;

  cityName.textContent = city;
  temperature.textContent = `${current.temperature}°C`;

//   description.textContent = current.weather_code;
//   humidity.textContent = `${current.humidity}%`;
  windSpeed.textContent = `${current.windspeed} km/h`;
  pressure.textContent = `${current.pressure_msl} hPa`;
    weatherDetails.classList.remove("hidden");
    noResult.classList.add("hidden");

}
displayWeather(city, data);
    