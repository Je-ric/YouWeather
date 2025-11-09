import './style.css'


const JOKE = import.meta.env.VITE_JOKE_KEY;;
const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const provinceInput = document.getElementById("provinceInput");
const weatherResults = document.getElementById("weatherResults");
const weatherResults2 = document.getElementById("weatherResults2");
const hourlyForecast = document.getElementById("hourlyForecast");
const weeklyForecast = document.getElementById("weeklyForecast");
const advisory = document.getElementById("advisory");
const locationBtn = document.getElementById("locationBtn");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  const province = provinceInput.value.trim();

  if (city) {
    getWeather(city, province);
  }
});

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => getWeatherByCoords(position.coords.latitude, position.coords.longitude),
      () => alert("Location access denied")
    );
  }
});

function getWeather(city, province = "") {
  let query = `${city},PH`;
  if (province.trim()) {
    query = `${city},${province},PH`;
  }

  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${JOKE}`)
    .then(res => res.json())
    .then(locations => {
      if (locations.length === 0) {
        weatherResults.innerHTML = "<div class='empty-state'><i class='bx bx-x-circle'></i><p style='font-size: 1rem;'>Location not found. Try again.</p></div>";
        return;
      }

      const location = locations[0];
      getWeatherByCoords(location.lat, location.lon);
    })
    .catch(() => weatherResults.innerHTML = "<div class='empty-state'><p>Error fetching location data</p></div>");
}

function getWeatherByCoords(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${JOKE}&units=metric`)
    .then(res => res.json())
    .then(data => {
      displayWeather(data);
      displayWeather2(data);
      displayAdvisory(data);

      weatherResults.innerHTML += `
                        <button onclick="pinLocation('${data.name}', ${lat}, ${lon})"
                            class="btn btn-small ${isPinned(lat, lon) ? 'btn-disabled' : 'btn-primary'}"
                            ${isPinned(lat, lon) ? 'disabled' : ''}>
                            <i class="bx ${isPinned(lat, lon) ? 'bx-check-circle' : 'bx-map-pin'}"></i>
                            ${isPinned(lat, lon) ? "Already Pinned" : "Pin Location"}
                        </button>
                    `;
    });
}

function displayWeather(data) {
  const currentTime = new Date();
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentTime.toLocaleDateString('en-US', options);

  const weatherInfo = getFriendlyWeatherDescription(data.weather[0].description);

  weatherResults.innerHTML = `
                <div class="weather-header">
                    <div class="location-info">
                        <h2>${data.name}, ${data.sys.country}</h2>
                        <p>${formattedDate}</p>
                    </div>
                    <img src="${weatherInfo.image}" alt="${weatherInfo.text}" class="weather-icon">
                </div>

                <div class="temp-display">
                    <div class="temperature">${data.main.temp.toFixed(0)}°C</div>
                    <div class="weather-description">${weatherInfo.text}</div>
                    <p style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.9rem;">Updated at ${formattedTime}</p>
                </div>
            `;

  getWeeklyForecast(data.coord.lat, data.coord.lon);
  displayHourlyForecast(data.coord.lat, data.coord.lon);
}

function displayWeather2(data) {
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const precipitation = data.rain ? (data.rain["1h"] || 0) : 0;

  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${JOKE}&units=metric`)
    .then(res => res.json())
    .then(forecastData => {
      const rainChance = forecastData.list[0].pop ? (forecastData.list[0].pop * 100).toFixed(0) : "0";

      weatherResults2.innerHTML = `
                        <div class="weather-details">
                            <div class="detail-item">
                                <div class="detail-icon"><i class='bx bx-thermometer'></i></div>
                                <div class="detail-content">
                                    <p>Feels Like</p>
                                    <p>${data.main.feels_like.toFixed(1)}°C</p>
                                </div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-icon"><i class='bx bx-droplet'></i></div>
                                <div class="detail-content">
                                    <p>Humidity</p>
                                    <p>${data.main.humidity}%</p>
                                </div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-icon"><i class='bx bx-bar-chart-alt-2'></i></div>
                                <div class="detail-content">
                                    <p>Pressure</p>
                                    <p>${data.main.pressure} mb</p>
                                </div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-icon"><i class='bx bx-wind'></i></div>
                                <div class="detail-content">
                                    <p>Wind Speed</p>
                                    <p>${(data.wind.speed * 3.6).toFixed(1)} Km/H</p>
                                </div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-icon"><i class='bx bx-cloud-rain'></i></div>
                                <div class="detail-content">
                                    <p>Precipitation</p>
                                    <p>${precipitation.toFixed(1)} mm</p>
                                </div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-icon"><i class='bx bx-water'></i></div>
                                <div class="detail-content">
                                    <p>Rain Chance</p>
                                    <p>${rainChance}%</p>
                                </div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-icon"><i class='bx bxs-sun'></i></div>
                                <div class="detail-content">
                                    <p>Sunrise</p>
                                    <p>${sunrise}</p>
                                </div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-icon"><i class='bx bxs-moon'></i></div>
                                <div class="detail-content">
                                    <p>Sunset</p>
                                    <p>${sunset}</p>
                                </div>
                            </div>
                        </div>
                    `;
    });
}

function displayAdvisory(data) {
  const temp = data.main.temp;
  const wind = data.wind.speed;
  const humidity = data.main.humidity;
  const weather = data.weather[0].main.toLowerCase();
  let message = "";
  let icon = "bx-info-circle";

  if (weather.includes("rain")) {
    message = "High rainfall expected - postpone field operations and ensure proper drainage for crops.";
    icon = "bx-cloud-rain";
  } else if (temp > 35) {
    message = "Extreme heat warning - provide shade for livestock, increase irrigation, and monitor crops for heat stress.";
    icon = "bx-hot";
  } else if (wind > 10) {
    message = "High winds detected - secure equipment, support tall crops, and monitor for wind damage.";
    icon = "bx-wind";
  } else if (humidity > 85) {
    message = "Very high humidity - watch for fungal diseases and increase ventilation around crops.";
    icon = "bx-droplet";
  } else if (humidity < 30) {
    message = "Very dry conditions - increase irrigation frequency to prevent crop stress.";
    icon = "bx-sun";
  } else {
    message = "Favorable conditions - excellent day for field work and crop maintenance.";
    icon = "bx-smile";
  }

  advisory.innerHTML = `
                <i class='bx ${icon} advisory-icon'></i>
                <div class="advisory-content">
                    <div class="advisory-label">🌾 Farming Advisory</div>
                    <p>${message}</p>
                </div>
            `;
}

function displayHourlyForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${JOKE}&units=metric`)
    .then(res => res.json())
    .then(data => {
      hourlyForecast.innerHTML = "";

      const currentDate = new Date().toISOString().split("T")[0];
      const todayForecast = data.list.filter(entry => entry.dt_txt.startsWith(currentDate));

      todayForecast.forEach(hour => {
        const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const temp = hour.main.temp.toFixed(0);
        const weatherIcon = `https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`;
        const rainChance = hour.pop ? (hour.pop * 100).toFixed(0) : "0";

        hourlyForecast.innerHTML += `
                            <div class="hourly-item">
                                <div class="hourly-time">${time}</div>
                                <img src="${weatherIcon}" alt="${hour.weather[0].description}" class="hourly-icon">
                                <div class="hourly-temp">${temp}°C</div>
                                <div class="hourly-rain">🌧️ ${rainChance}%</div>
                            </div>
                        `;
      });
    })
    .catch(error => console.error("Error fetching hourly forecast:", error));
}

function getWeeklyForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${JOKE}&units=metric`)
    .then(res => res.json())
    .then(data => {
      weeklyForecast.innerHTML = "";

      const daily = {};
      data.list.forEach(entry => {
        let date = entry.dt_txt.split(" ")[0];
        if (!daily[date]) {
          const weatherInfo = getFriendlyWeatherDescription(entry.weather[0].description);
          let rainChance = entry.pop ? (entry.pop * 100).toFixed(0) : "0";
          if (rainChance < 1) rainChance = "0";
          let precipitation = entry.rain ? entry.rain['3h'] : 0;

          daily[date] = {
            minTemp: entry.main.temp_min,
            maxTemp: entry.main.temp_max,
            weather: weatherInfo.text,
            icon: weatherInfo.image,
            rainChance: rainChance,
            precipitation: precipitation,
            fullDate: new Date(entry.dt_txt),
          };
        } else {
          daily[date].minTemp = Math.min(daily[date].minTemp, entry.main.temp_min);
          daily[date].maxTemp = Math.max(daily[date].maxTemp, entry.main.temp_max);
          if (entry.pop > daily[date].rainChance) {
            daily[date].rainChance = entry.pop;
          }
          if (entry.rain && entry.rain['3h']) {
            daily[date].precipitation += entry.rain['3h'];
          }
        }
      });

      const forecastArray = Object.values(daily).slice(0, 7);

      forecastArray.forEach(day => {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const formattedDate = day.fullDate.toLocaleDateString('en-US', options);

        weeklyForecast.innerHTML += `
                            <div class="forecast-item">
                                <div class="forecast-date">${formattedDate}</div>
                                <img src="${day.icon}" alt="${day.weather}" class="forecast-icon">
                                <div class="forecast-weather">${day.weather}</div>
                                <div class="forecast-temps">
                                    <span class="temp-max">${day.maxTemp.toFixed(0)}°</span>
                                    <span class="temp-min">/ ${day.minTemp.toFixed(0)}°</span>
                                </div>
                                <div class="forecast-rain">🌧️ ${day.rainChance}%</div>
                                <div class="forecast-precip">💧 ${day.precipitation.toFixed(1)}mm</div>
                            </div>
                        `;
      });
    });
}

function getFriendlyWeatherDescription(description) {
  const weatherMapping = {
    "clear sky": { text: "Clear Sky", image: "/images/v1/sunny.png" },
    "few clouds": { text: "Mostly Sunny", image: "/images/v1/sunny_s_cloudy.png" },
    "scattered clouds": { text: "Partly Cloudy", image: "/images/v1/partly_cloudy.png" },
    "broken clouds": { text: "Cloudy", image: "/images/v1/cloudy_s_sunny.png" },
    "overcast clouds": { text: "Overcast", image: "/images/v1/cloudy.png" },
    "light rain": { text: "Light Rain", image: "/images/v1/rain_light.png" },
    "moderate rain": { text: "Moderate Rain", image: "/images/v1/rain.png" },
    "heavy intensity rain": { text: "Heavy Rain", image: "/images/v1/rain_heavy.png" },
    "thunderstorm": { text: "⚡ Thunderstorm", image: "/images/v1/thunderstorms.png" },
  };

  return weatherMapping[description.toLowerCase()] || { text: description, image: "/images/v1/default.png" };
}


// Pinned Locations
const pinLimit = 3;
const pinnedLocations = JSON.parse(localStorage.getItem("pinnedLocations")) || [];
const pinnedLocationsDiv = document.getElementById("pinnedLocations");

function isPinned(lat, lon) {
  return pinnedLocations.some(loc => loc.lat === lat && loc.lon === lon);
}

function savePinnedLocations() {
  localStorage.setItem("pinnedLocations", JSON.stringify(pinnedLocations));
  displayPinnedLocations();
}

function pinLocation(name, lat, lon) {
  if (pinnedLocations.length >= pinLimit) {
    alert("You have reached the maximum of 3 pinned locations.");
    return;
  }

  if (isPinned(lat, lon)) {
    alert("Location is already pinned!");
    return;
  }

  pinnedLocations.push({ name, lat, lon });
  savePinnedLocations();
}

function removePinnedLocation(lat, lon) {
  const index = pinnedLocations.findIndex(loc => loc.lat === lat && loc.lon === lon);
  if (index !== -1) {
    pinnedLocations.splice(index, 1);
    savePinnedLocations();
  }
}

function displayPinnedLocations() {
  pinnedLocationsDiv.innerHTML = "";

  if (pinnedLocations.length === 0) {
    pinnedLocationsDiv.innerHTML = '<div class="empty-state"><i class="bx bx-map-pin"></i><p>No locations pinned yet. Pin a location to save it!</p></div>';
    return;
  }

  pinnedLocations.forEach(loc => {
    const locationDiv = document.createElement("div");
    locationDiv.classList.add("pinned-item");

    locationDiv.innerHTML = `
                    <div>
                        <div class="pinned-name">${loc.name}</div>
                        
                    </div>
                    <div class="pinned-actions">
                        <button onclick="getWeatherByCoords(${loc.lat}, ${loc.lon})" class="btn btn-small btn-primary">
                            <i class="bx bx-calendar"></i> View
                        </button>
                        <button onclick="removePinnedLocation(${loc.lat}, ${loc.lon})" class="btn btn-small btn-danger">
                            <i class="bx bx-trash"></i> Remove
                        </button>
                    </div>
                `;

    pinnedLocationsDiv.appendChild(locationDiv);
  });
}

document.addEventListener("DOMContentLoaded", displayPinnedLocations);

// expose functions used by inline onclick handlers so HTML can call them
// pag wala, hindi pwede since its external
window.pinLocation = pinLocation;
window.removePinnedLocation = removePinnedLocation;
window.getWeatherByCoords = getWeatherByCoords;
window.isPinned = isPinned;