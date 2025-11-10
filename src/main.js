const JOKE = import.meta.env.VITE_JOKE_KEY
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

  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${JOKE}`)
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
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${JOKE}&units=metric`)
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
  <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-6 border-b border-blue-100">
    <!-- Location & Date -->
    <div>
      <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">${data.name}, ${data.sys.country}</h2>
      <p class="text-gray-600">${formattedDate}</p>
    </div>

    <!-- Weather Icon -->
    <div class="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-2xl shadow-md">
      <img src="${weatherInfo.image}" alt="${weatherInfo.text}" class="w-40 h-40 object-contain">
    </div>
  </div>

  <!-- Main Temperature -->
  <div class="mb-8 flex flex-col items-start md:items-center">
    <div class="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-2 drop-shadow-md">
      ${data.main.temp.toFixed(0)}°C
    </div>
    <div class="text-2xl md:text-3xl text-gray-700 flex items-center gap-2 font-semibold">
      <i class='bx bx-sun text-yellow-400'></i> ${weatherInfo.text}
    </div>
    <p class="text-gray-500 text-sm mt-2">Updated at ${formattedTime}</p>
  </div>
`


  getWeeklyForecast(data.coord.lat, data.coord.lon)
  displayHourlyForecast(data.coord.lat, data.coord.lon)
}

function displayWeather2(data) {
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const precipitation = data.rain ? data.rain["1h"] || 0 : 0

  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${JOKE}&units=metric`,
  )
    .then((res) => res.json())
    .then((forecastData) => {
      const rainChance = forecastData.list[0].pop ? (forecastData.list[0].pop * 100).toFixed(0) : "0"

     weatherResults2.innerHTML = `
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-800">
      <i class='bx bx-info-circle text-cyan-500'></i> Weather Details
    </div>

    <!-- Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-blue-200 border-t border-b border-blue-100 rounded-xl overflow-hidden">
      
      <!-- Feels Like -->
      <div class="flex items-start gap-4 p-4">
        <div class="text-3xl text-cyan-500 flex-shrink-0 mt-1"><i class='bx bxs-sun'></i></div>
        <div>
          <p class="text-gray-600 text-sm mb-1 font-semibold">Feels Like</p>
          <p class="text-2xl font-bold text-gray-900">${data.main.feels_like.toFixed(1)}°C</p>
        </div>
      </div>

      <!-- Humidity -->
      <div class="flex items-start gap-4 p-4">
        <div class="text-3xl text-cyan-500 flex-shrink-0 mt-1"><i class='bx bx-droplet'></i></div>
        <div>
          <p class="text-gray-600 text-sm mb-1 font-semibold">Humidity</p>
          <p class="text-2xl font-bold text-gray-900">${data.main.humidity}%</p>
        </div>
      </div>

      <!-- Pressure -->
      <div class="flex items-start gap-4 p-4">
        <div class="text-3xl text-cyan-500 flex-shrink-0 mt-1"><i class='bx bx-bar-chart-alt-2'></i></div>
        <div>
          <p class="text-gray-600 text-sm mb-1 font-semibold">Pressure</p>
          <p class="text-2xl font-bold text-gray-900">${data.main.pressure} mb</p>
        </div>
      </div>

      <!-- Wind -->
      <div class="flex items-start gap-4 p-4">
        <div class="text-3xl text-cyan-500 flex-shrink-0 mt-1"><i class='bx bx-wind'></i></div>
        <div>
          <p class="text-gray-600 text-sm mb-1 font-semibold">Wind Speed</p>
          <p class="text-2xl font-bold text-gray-900">${(data.wind.speed * 3.6).toFixed(1)} Km/H</p>
        </div>
      </div>

      <!-- Precipitation -->
      <div class="flex items-start gap-4 p-4">
        <div class="text-3xl text-cyan-500 flex-shrink-0 mt-1"><i class='bx bx-cloud-rain'></i></div>
        <div>
          <p class="text-gray-600 text-sm mb-1 font-semibold">Precipitation</p>
          <p class="text-2xl font-bold text-gray-900">${precipitation.toFixed(1)} mm</p>
        </div>
      </div>

      <!-- Rain Chance -->
      <div class="flex items-start gap-4 p-4">
        <div class="text-3xl text-cyan-500 flex-shrink-0 mt-1"><i class='bx bx-water'></i></div>
        <div>
          <p class="text-gray-600 text-sm mb-1 font-semibold">Rain Chance</p>
          <p class="text-2xl font-bold text-gray-900">${rainChance}%</p>
        </div>
      </div>

      <!-- Sunrise -->
      <div class="flex items-start gap-4 p-4">
        <div class="text-3xl text-cyan-500 flex-shrink-0 mt-1"><i class='bx bxs-sun'></i></div>
        <div>
          <p class="text-gray-600 text-sm mb-1 font-semibold">Sunrise</p>
          <p class="text-2xl font-bold text-gray-900">${sunrise}</p>
        </div>
      </div>

      <!-- Sunset -->
      <div class="flex items-start gap-4 p-4">
        <div class="text-3xl text-cyan-500 flex-shrink-0 mt-1"><i class='bx bxs-moon'></i></div>
        <div>
          <p class="text-gray-600 text-sm mb-1 font-semibold">Sunset</p>
          <p class="text-2xl font-bold text-gray-900">${sunset}</p>
        </div>
      </div>

    </div>
  </div>
`

    })
}

function displayAdvisory(data) {
  const temp = data.main.temp
  const wind = data.wind.speed
  const humidity = data.main.humidity
  const weather = data.weather[0].main.toLowerCase()
  let message = ""
  let icon = "bx-info-circle"

  if (weather.includes("rain")) {
    message = "High rainfall expected - postpone field operations and ensure proper drainage for crops."
    icon = "bx-cloud-rain"
  } else if (temp > 35) {
    message =
      "Extreme heat warning - provide shade for livestock, increase irrigation, and monitor crops for heat stress."
    icon = "bx-hot"
  } else if (wind > 10) {
    message = "High winds detected - secure equipment, support tall crops, and monitor for wind damage."
    icon = "bx-wind"
  } else if (humidity > 85) {
    message = "Very high humidity - watch for fungal diseases and increase ventilation around crops."
    icon = "bx-droplet"
  } else if (humidity < 30) {
    message = "Very dry conditions - increase irrigation frequency to prevent crop stress."
    icon = "bx-sun"
  } else {
    message = "Favorable conditions - excellent day for field work and crop maintenance."
    icon = "bx-smile"
  }

  advisory.innerHTML = `
                <i class='bx ${icon} text-3xl text-amber-500 flex-shrink-0 mt-1'></i>
                <div class="flex-1">
                    <div class="font-bold text-gray-900 mb-2">🌾 Farming Advisory</div>
                    <p class="text-gray-700">${message}</p>
                </div>
            `
}

function displayHourlyForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${JOKE}&units=metric`)
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
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${JOKE}&units=metric`)
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
  pinnedLocationsDiv.innerHTML = ""

  if (pinnedLocations.length === 0) {
    pinnedLocationsDiv.innerHTML =
      '<div class="col-span-full text-center py-12 text-gray-600"><i class="bx bx-map-pin text-5xl mb-4 text-cyan-400 opacity-50"></i><p class="text-lg">No locations pinned yet. Pin a location to save it!</p></div>'
    return
  }

  pinnedLocations.forEach((loc) => {
    const locationDiv = document.createElement("div")
    locationDiv.classList.add(
      "bg-gradient-to-br",
      "from-blue-50",
      "to-cyan-50",
      "border",
      "border-blue-200",
      "rounded-2xl",
      "p-6",
      "flex",
      "flex-col",
      "sm:flex-row",
      "sm:justify-between",
      "sm:items-center",
      "gap-4",
      "hover:shadow-md",
      "transition-all",
    )

    locationDiv.innerHTML = `
                    <div>
                        <div class="font-bold text-gray-900 text-lg">${loc.name}</div>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="getWeatherByCoords(${loc.lat}, ${loc.lon})" class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl flex items-center gap-2 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
                            <i class="bx bx-calendar"></i> View
                        </button>
                        <button onclick="removePinnedLocation(${loc.lat}, ${loc.lon})" class="px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-xl flex items-center gap-2 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
                            <i class="bx bx-trash"></i> Remove
                        </button>
                    </div>
                `

    pinnedLocationsDiv.appendChild(locationDiv)
  })
}

document.addEventListener("DOMContentLoaded", displayPinnedLocations)

// expose functions used by inline onclick handlers so HTML can call them
window.pinLocation = pinLocation
window.removePinnedLocation = removePinnedLocation
window.getWeatherByCoords = getWeatherByCoords
window.isPinned = isPinned
