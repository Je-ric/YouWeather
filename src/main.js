import './style.css';

function proxy(url) {
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
}

// const JOKE = import.meta.env.VITE_JOKE_KEY
// const JOKE = import.meta.env.VITE_JOKE_KEY2
const JOKE = "5de15b7804e0078404a629b6de093fb2"
const form = document.getElementById("weatherForm")
const cityInput = document.getElementById("cityInput")
const provinceInput = document.getElementById("provinceInput")
const weatherResults = document.getElementById("weatherResults")
const weatherResults2 = document.getElementById("weatherResults2")
const hourlyForecast = document.getElementById("hourlyForecast")
const weeklyForecast = document.getElementById("weeklyForecast")
const advisory = document.getElementById("advisory")
const locationBtn = document.getElementById("locationBtn")

form.addEventListener("submit", (e) => {
  e.preventDefault()
  const city = cityInput.value.trim()
  const province = provinceInput.value.trim()

  if (city) {
    getWeather(city, province)
  }
})

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => getWeatherByCoords(position.coords.latitude, position.coords.longitude),
      () => alert("Location access denied"),
    )
  }
})

function getWeather(city, province = "") {
  let query = `${city},PH`
  if (province.trim()) {
    query = `${city},${province},PH`
  }

  // fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${JOKE}`)
    fetch(proxy(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${JOKE}`))
    .then((res) => res.json())
    .then((locations) => {
      if (locations.length === 0) {
        weatherResults.innerHTML =
          "<div class='text-center py-12 text-gray-600'><i class='bx bx-x-circle text-4xl mb-2 text-red-500'></i><p class='text-lg'>Location not found. Try again.</p></div>"
        return
      }

      const location = locations[0]
      getWeatherByCoords(location.lat, location.lon)
    })
    .catch(
      () =>
        (weatherResults.innerHTML =
          "<div class='text-center py-12 text-gray-600'><p>Error fetching location data</p></div>"),
    )
}

function getWeatherByCoords(lat, lon) {
  // fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${JOKE}&units=metric`)
  fetch(proxy(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${JOKE}&units=metric`))

    .then((res) => res.json())
    .then((data) => {
      displayWeather(data)
      displayWeather2(data)
      displayAdvisory(data)

      weatherResults.innerHTML += `
                        <button onclick="pinLocation('${data.name}', ${lat}, ${lon})"
                            class="btn-small mt-6 ${isPinned(lat, lon) ? "opacity-60 cursor-not-allowed" : ""} ${isPinned(lat, lon) ? "bg-gray-300 text-gray-700" : "bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:-translate-y-0.5"} px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold"
                            ${isPinned(lat, lon) ? "disabled" : ""}>
                            <i class="bx ${isPinned(lat, lon) ? "bx-check-circle" : "bx-map-pin"}"></i>
                            ${isPinned(lat, lon) ? "Already Pinned" : "Pin Location"}
                        </button>
                    `
    })
}

function displayWeather(data) {
  const currentTime = new Date()
  const formattedTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  const formattedDate = currentTime.toLocaleDateString("en-US", options)

  const weatherInfo = getFriendlyWeatherDescription(data.weather[0].description)

weatherResults.innerHTML = `
  <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 pb-4 border-b border-blue-100">
    <!-- Location & Date -->
    <div>
      <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">${data.name}, ${data.sys.country}</h2>
      <p class="text-gray-500 text-sm">${formattedDate}</p>
      <div class="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-md">
      ${data.main.temp.toFixed(0)}°C
    </div>
    <div class="flex items-center gap-2 text-gray-700 font-semibold text-lg md:text-xl">
      <i class='bx bx-sun text-yellow-400 text-2xl'></i> ${weatherInfo.text}
    </div>
    <p class="text-gray-400 text-xs md:text-sm">Updated at ${formattedTime}</p>
    </div>

    <!-- Weather Icon -->
    <div class="bg-gradient-to-br from-blue-100 to-cyan-100 p-3 rounded-xl shadow-md">
      <img src="${weatherInfo.image}" alt="${weatherInfo.text}" class="w-28 h-28 md:w-36 md:h-36 object-contain">
    </div>
  </div>
  
`;


  getWeeklyForecast(data.coord.lat, data.coord.lon)
  displayHourlyForecast(data.coord.lat, data.coord.lon)
}

function displayWeather2(data) {
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const precipitation = data.rain ? data.rain["1h"] || 0 : 0

  // fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${JOKE}&units=metric`,)
  fetch(proxy(`https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${JOKE}&units=metric`,))

    .then((res) => res.json())
    .then((forecastData) => {
      const rainChance = forecastData.list[0].pop ? (forecastData.list[0].pop * 100).toFixed(0) : "0"

    weatherResults2.innerHTML = `
      <div class="flex flex-col h-full">

        <div class="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800">
          <i class='bx bx-info-circle text-cyan-500'></i> Weather Details
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          
          ${[
            { icon: 'bxs-sun', label: 'Feels Like', value: `${data.main.feels_like.toFixed(1)}°C` },
            { icon: 'bx-droplet', label: 'Humidity', value: `${data.main.humidity}%` },
            { icon: 'bx-bar-chart-alt-2', label: 'Pressure', value: `${data.main.pressure} mb` },
            { icon: 'bx-wind', label: 'Wind', value: `${(data.wind.speed * 3.6).toFixed(1)} Km/H` },
            { icon: 'bx-cloud-rain', label: 'Precipitation', value: `${precipitation.toFixed(1)} mm` },
            { icon: 'bx-water', label: 'Rain Chance', value: `${rainChance}%` },
            { icon: 'bxs-sun', label: 'Sunrise', value: sunrise },
            { icon: 'bxs-moon', label: 'Sunset', value: sunset }
          ].map(metric => `
            <div class="flex items-center gap-2 p-2 bg-white/70 rounded-xl shadow-sm hover:shadow-md transition">
              <i class='bx ${metric.icon} text-cyan-500 text-xl flex-shrink-0'></i>
              <div>
                <p class="text-gray-600 text-xs md:text-sm font-medium">${metric.label}</p>
                <p class="text-gray-900 font-bold text-sm md:text-base">${metric.value}</p>
              </div>
            </div>
          `).join('')}
          
        </div>
      </div>
      
      `;
      
    })


}

function displayAdvisory(data, forecastData) {
  const temp = data.main.temp;
  const wind = data.wind.speed;
  const gust = data.wind.gust ?? 0;
  const humidity = data.main.humidity;
  const weather = data.weather[0].main.toLowerCase();
  const precipitation1h = data.rain ? (data.rain["1h"] || 0) : 0;
  const pop = forecastData?.list?.[0]?.pop ? (forecastData.list[0].pop * 100) : 0;
  const cloudCover = data.clouds?.all ?? 0;  // in % if available

  const advisories = [];

  // 1. Heavy rainfall / waterlogging risk  
  if (precipitation1h > 15) {
    advisories.push("Heavy rainfall detected — ensure drainage, delay fertilizer application, and protect crops from standing water.");
  }

  // 2. Prolonged dry + high temp + low humidity → drought stress  
  if (humidity < 30 && temp > 30 && precipitation1h === 0) {
    advisories.push("Very dry and hot conditions — increase irrigation frequency and apply mulch to reduce water loss.");
  }

  // 3. High humidity + moderate temp → disease risk  
  if (humidity > 85 && temp > 15 && temp < 30) {
    advisories.push("Warm and humid conditions favour fungal/bacterial diseases — inspect crops for leaf spots, blight, and ensure good ventilation.");
  }

  // 4. Strong wind + rain → lodging / physical damage  
  if (wind > 12 && precipitation1h > 5) {
    advisories.push("High winds and rainfall — tall crops may lodge, secure equipment, delay spraying operations.");
  }

  // 5. Extreme heat  
  if (temp > 35) {
    advisories.push("Extreme heat warning — provide shade for livestock, increase irrigation, and monitor crops for heat stress.");
  }

  // 6. Frost / near‑freezing risk  
  if (temp < 2) {
    advisories.push("Frost or freezing risk — cover sensitive crops, harvest early if possible, protect from cold damage.");
  }

  // 7. Cloud cover + low sunshine hours during flowering stage  
  if (cloudCover > 80 && temp > 20 && precipitation1h > 0) {
    advisories.push("Heavy cloud cover and rain during flowering/pollination can reduce yield and quality — consider delaying operations or adjusting crop management.");
  }

  // 8. High rain probability upcoming (POP)  
  if (pop > 70) {
    advisories.push("High chance of rain ahead (>70%) — postpone fieldwork, protect harvested produce and leach nutrients from saturated soils.");
  }

  // 9. Low wind + heavy rainfall → waterlogging risk  
  if (wind < 3 && precipitation1h > 10) {
    advisories.push("Rainfall with minimal wind may result in poor drying conditions and water‑logging — ensure fields drain properly.");
  }

  // 10. High wind gusts (even if average wind moderate) → crop damage / wind stress  
  if (gust > 15) {
    advisories.push("High wind gusts detected — risk of lodging, crop breakage and spray drift; secure structures and postpone sensitive operations.");
  }

  // 11. Very low humidity + moderate temp → stress on crops / increased transpiration  
  if (humidity < 25 && temp > 20 && temp < 30) {
    advisories.push("Very low humidity with moderate temperature — crops may lose moisture quickly, increase irrigation or shade where possible.");
  }

  // 12. Precipitation + high humidity → fungal risk, nutrient leaching  
  if (precipitation1h > 5 && humidity > 80) {
    advisories.push("Rain and high humidity together increase risk of fungal diseases and nutrient leaching — monitor soil fertility and crop health.");
  }

  // 13. Cold night following warm day (temp drop)  
  // (assume you have minTemp for day)  
  const minTemp = data.main.temp_min;
  if (minTemp < 5 && temp > 20) {
    advisories.push("Sudden drop in night temperature following warm day — risk of crop stress and frost pockets, especially in low‑lying fields.");
  }

  // 14. High temperature + wind + low humidity → fire risk (pasture/crop residue)  
  if (temp > 33 && wind > 10 && humidity < 30) {
    advisories.push("Hot, windy and dry conditions — elevated risk of fire in crop residues or pastures; clear debris and monitor flammable zones.");
  }

  // 15. Excessive rainfall leading to soil erosion or nutrient loss  
  if (precipitation1h > 20) {
    advisories.push("Excessive rainfall — soil erosion and nutrient loss likely, implement soil conservation practices and secure vulnerable slopes.");
  }

  // 16. High humidity + low wind + moderate rain → stagnant air risk (disease, pest increase)  
  if (humidity > 80 && wind < 2 && precipitation1h > 2) {
    advisories.push("Stagnant humid air with light rain — increased pest and disease pressure; inspect crops and consider ventilation or treatment.");
  }

  // 17. Heavy rainfall + muddy field conditions → delayed harvest or planting  
  if (precipitation1h > 8 && wind < 4) {
    advisories.push("Fields could become muddy and inaccessible — postpone harvesting or planting to avoid soil compaction and yield loss.");
  }

  // 18. Low cloud cover + very high solar radiation + high temperature → heat stress in livestock and crops  
  if (cloudCover < 10 && temp > 30 && humidity < 50) {
    advisories.push("Clear skies with high temperature and low humidity — risk of heat stress on crops and livestock; provide shade and adequate water.");
  }

  // 19. Rain‑free forecast + high transpiration demand (humidity low, temp moderate) → irrigation planning  
  if (precipitation1h === 0 && pop < 20 && humidity < 40 && temp > 22) {
    advisories.push("No rain expected and high transpiration demand — schedule irrigation and monitor soil moisture carefully.");
  }

  // 20. Flood/typhoon storm scenario (extreme wind + extreme rainfall)  
  if (wind > 20 && precipitation1h > 30) {
    advisories.push("Severe storm/typhoon conditions — major risk of crop damage, flooding and infrastructure failure; evacuate equipment and implement emergency protocols.");
  }

  // 21. Moderate rainfall + strong cloud cover during planting stage → seed germination risk  
  if (precipitation1h > 3 && cloudCover > 70 && temp > 18) {
    advisories.push("Low light and moderate rainfall during planting/early germination stage — risk of poor seed emergence; ensure field drainage and consider delayed sowing.");
  }

  // At least one default advisory if none above  
  if (advisories.length === 0) {
    advisories.push("Conditions are generally favourable — good day for field work and crop maintenance.");
  }

  // Combine advisories into one HTML block  
  const advisoryHtml = advisories.map(msg => `<p class="text-gray-700 mb-2">• ${msg}</p>`).join("");

  advisory.innerHTML = `
    <i class='bx bx-info-circle text-3xl text-amber-500 flex-shrink-0 mt-1'></i>
    <div class="flex-1">
      <div class="font-bold text-gray-900 mb-2">🌾 Farming Advisory</div>
      ${advisoryHtml}
    </div>
  `;
}


function displayHourlyForecast(lat, lon) {
  // fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${JOKE}&units=metric`)
  fetch(proxy(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${JOKE}&units=metric`))

    .then((res) => res.json())
    .then((data) => {
      hourlyForecast.innerHTML = ""

      const currentDate = new Date().toISOString().split("T")[0]
      const todayForecast = data.list.filter((entry) => entry.dt_txt.startsWith(currentDate))

      todayForecast.forEach((hour) => {
        const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const temp = hour.main.temp.toFixed(0)
        const weatherIcon = `https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`
        const rainChance = hour.pop ? (hour.pop * 100).toFixed(0) : "0"

        hourlyForecast.innerHTML += `
  <div class="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 w-full text-center hover:shadow-md hover:-translate-y-1 transition-all">
      <div class="font-bold text-gray-700 mb-2 text-sm">${time}</div>
      <img src="${weatherIcon}" alt="${hour.weather[0].description}" class="w-10 h-10 mx-auto">
      <div class="text-xl font-bold text-blue-600 mb-2">${temp}°C</div>
      <div class="text-cyan-600 text-sm">🌧️ ${rainChance}%</div>
  </div>
`

      })
    })
    .catch((error) => console.error("Error fetching hourly forecast:", error))
}

function getWeeklyForecast(lat, lon) {
  // fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${JOKE}&units=metric`)
    fetch(proxy(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${JOKE}&units=metric`))

    .then((res) => res.json())
    .then((data) => {
      weeklyForecast.innerHTML = ""

      const daily = {}
      data.list.forEach((entry) => {
        const date = entry.dt_txt.split(" ")[0]
        if (!daily[date]) {
          const weatherInfo = getFriendlyWeatherDescription(entry.weather[0].description)
          let rainChance = entry.pop ? (entry.pop * 100).toFixed(0) : "0"
          if (rainChance < 1) rainChance = "0"
          const precipitation = entry.rain ? entry.rain["3h"] : 0

          daily[date] = {
            minTemp: entry.main.temp_min,
            maxTemp: entry.main.temp_max,
            weather: weatherInfo.text,
            icon: weatherInfo.image,
            rainChance: rainChance,
            precipitation: precipitation,
            fullDate: new Date(entry.dt_txt),
          }
        } else {
          daily[date].minTemp = Math.min(daily[date].minTemp, entry.main.temp_min)
          daily[date].maxTemp = Math.max(daily[date].maxTemp, entry.main.temp_max)
          if (entry.pop > daily[date].rainChance) {
            daily[date].rainChance = entry.pop
          }
          if (entry.rain && entry.rain["3h"]) {
            daily[date].precipitation += entry.rain["3h"]
          }
        }
      })

      const forecastArray = Object.values(daily).slice(0, 7)

      forecastArray.forEach((day) => {
        const options = { weekday: "short", month: "short", day: "numeric" }
        const formattedDate = day.fullDate.toLocaleDateString("en-US", options)

        weeklyForecast.innerHTML += `
                      <div class="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-5 text-center hover:shadow-md hover:-translate-y-2 transition-all cursor-pointer">
                        <div class="font-bold text-gray-600 mb-3 text-sm">${formattedDate}</div>
                        <img src="${day.icon}" alt="${day.weather}" class="w-12 h-12 mx-auto mb-2">
                        <div class="text-gray-700 text-sm mb-2">${day.weather}</div>
                        <div class="flex justify-center gap-1 font-bold mb-2">
                          <span class="text-blue-600">${day.maxTemp.toFixed(0)}°</span>
                          <span class="text-gray-500">/ ${day.minTemp.toFixed(0)}°</span>
                        </div>
                        <div class="text-cyan-600 text-xs mb-1">🌧️ ${day.rainChance}%</div>
                        <div class="text-gray-600 text-xs">💧 ${day.precipitation.toFixed(1)}mm</div>
                      </div>
                    `
      })
    })
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
    thunderstorm: { text: "⚡ Thunderstorm", image: "/images/v1/thunderstorms.png" },
  }

  return weatherMapping[description.toLowerCase()] || { text: description, image: "/images/v1/default.png" }
}

// Pinned Locations
const pinLimit = 3
const pinnedLocations = JSON.parse(localStorage.getItem("pinnedLocations")) || []
const pinnedLocationsDiv = document.getElementById("pinnedLocations")

function isPinned(lat, lon) {
  return pinnedLocations.some((loc) => loc.lat === lat && loc.lon === lon)
}

function savePinnedLocations() {
  localStorage.setItem("pinnedLocations", JSON.stringify(pinnedLocations))
  displayPinnedLocations()
}

function pinLocation(name, lat, lon) {
  if (pinnedLocations.length >= pinLimit) {
    alert("You have reached the maximum of 3 pinned locations.")
    return
  }

  if (isPinned(lat, lon)) {
    alert("Location is already pinned!")
    return
  }

  pinnedLocations.push({ name, lat, lon })
  savePinnedLocations()
}

function removePinnedLocation(lat, lon) {
  const index = pinnedLocations.findIndex((loc) => loc.lat === lat && loc.lon === lon)
  if (index !== -1) {
    pinnedLocations.splice(index, 1)
    savePinnedLocations()
  }
}

function displayPinnedLocations() {
  pinnedLocationsDiv.innerHTML = "";

  if (pinnedLocations.length === 0) {
    pinnedLocationsDiv.innerHTML =
      `<div class="col-span-full text-center py-12 text-gray-600">
         <i class="bx bx-map-pin text-5xl mb-4 text-cyan-400 opacity-50"></i>
         <p class="text-lg">No locations pinned yet. Pin a location to save it!</p>
       </div>`;
    return;
  }

  pinnedLocations.forEach((loc) => {
    const locationDiv = document.createElement("div");
    locationDiv.classList.add(
      "bg-white/70",
      "backdrop-blur-md",
      "border",
      "border-blue-200",
      "rounded-xl",
      "p-3",
      "flex",
      "items-center",
      "justify-between",
      "gap-2",
      "hover:shadow-md",
      "transition-all",
      "cursor-pointer"
    );

    locationDiv.innerHTML = `
      <div class="flex items-center gap-2">
        <i class='bx bx-map-pin text-cyan-500 text-2xl'></i>
        <span class="font-medium text-gray-800 text-sm">${loc.name}</span>
      </div>
      <div class="flex items-center gap-1">
        <i onclick="getWeatherByCoords(${loc.lat}, ${loc.lon})" class='bx bx-calendar text-gray-500 hover:text-cyan-500 text-xl'></i>
        <i onclick="removePinnedLocation(${loc.lat}, ${loc.lon})" class='bx bx-trash text-red-500 hover:text-red-600 text-xl'></i>
      </div>
    `;

    pinnedLocationsDiv.appendChild(locationDiv);
  });
}


document.addEventListener("DOMContentLoaded", displayPinnedLocations)

// expose functions used by inline onclick handlers so HTML can call them
window.pinLocation = pinLocation
window.removePinnedLocation = removePinnedLocation
window.getWeatherByCoords = getWeatherByCoords
window.isPinned = isPinned
