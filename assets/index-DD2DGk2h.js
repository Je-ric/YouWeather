(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const t of s)if(t.type==="childList")for(const a of t.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function i(s){const t={};return s.integrity&&(t.integrity=s.integrity),s.referrerPolicy&&(t.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?t.credentials="include":s.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(s){if(s.ep)return;s.ep=!0;const t=i(s);fetch(s.href,t)}})();const p="9505fd1df737e20152fbd78cdb289b6a",L=document.getElementById("weatherForm"),T=document.getElementById("cityInput"),k=document.getElementById("provinceInput"),u=document.getElementById("weatherResults"),F=document.getElementById("weatherResults2"),f=document.getElementById("hourlyForecast"),x=document.getElementById("weeklyForecast"),H=document.getElementById("advisory"),C=document.getElementById("locationBtn");L.addEventListener("submit",e=>{e.preventDefault();const n=T.value.trim(),i=k.value.trim();n&&E(n,i)});C.addEventListener("click",()=>{navigator.geolocation&&navigator.geolocation.getCurrentPosition(e=>h(e.coords.latitude,e.coords.longitude),()=>alert("Location access denied"))});function E(e,n=""){let i=`${e},PH`;n.trim()&&(i=`${e},${n},PH`),fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${i}&limit=5&appid=${p}`).then(o=>o.json()).then(o=>{if(o.length===0){u.innerHTML="<div class='text-center py-12 text-gray-600'><i class='bx bx-x-circle text-4xl mb-2 text-red-500'></i><p class='text-lg'>Location not found. Try again.</p></div>";return}const s=o[0];h(s.lat,s.lon)}).catch(()=>u.innerHTML="<div class='text-center py-12 text-gray-600'><p>Error fetching location data</p></div>")}function h(e,n){fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${e}&lon=${n}&appid=${p}&units=metric`).then(i=>i.json()).then(i=>{I(i),S(i),M(i),u.innerHTML+=`
                        <button onclick="pinLocation('${i.name}', ${e}, ${n})"
                            class="btn-small mt-6 ${m(e,n)?"opacity-60 cursor-not-allowed":""} ${m(e,n)?"bg-gray-300 text-gray-700":"bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:-translate-y-0.5"} px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold"
                            ${m(e,n)?"disabled":""}>
                            <i class="bx ${m(e,n)?"bx-check-circle":"bx-map-pin"}"></i>
                            ${m(e,n)?"Already Pinned":"Pin Location"}
                        </button>
                    `})}function I(e){const n=new Date,i=n.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),o={weekday:"long",year:"numeric",month:"long",day:"numeric"},s=n.toLocaleDateString("en-US",o),t=y(e.weather[0].description);u.innerHTML=`
  <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 pb-4 border-b border-blue-100">
    <!-- Location & Date -->
    <div>
      <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">${e.name}, ${e.sys.country}</h2>
      <p class="text-gray-500 text-sm">${s}</p>
      <div class="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-md">
      ${e.main.temp.toFixed(0)}°C
    </div>
    <div class="flex items-center gap-2 text-gray-700 font-semibold text-lg md:text-xl">
      <i class='bx bx-sun text-yellow-400 text-2xl'></i> ${t.text}
    </div>
    <p class="text-gray-400 text-xs md:text-sm">Updated at ${i}</p>
    </div>

    <!-- Weather Icon -->
    <div class="bg-gradient-to-br from-blue-100 to-cyan-100 p-3 rounded-xl shadow-md">
      <img src="${t.image}" alt="${t.text}" class="w-28 h-28 md:w-36 md:h-36 object-contain">
    </div>
  </div>
  
`,P(e.coord.lat,e.coord.lon),D(e.coord.lat,e.coord.lon)}function S(e){const n=new Date(e.sys.sunrise*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),i=new Date(e.sys.sunset*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),o=e.rain&&e.rain["1h"]||0;fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${e.coord.lat}&lon=${e.coord.lon}&appid=${p}&units=metric`).then(s=>s.json()).then(s=>{const t=s.list[0].pop?(s.list[0].pop*100).toFixed(0):"0";F.innerHTML=`
      <div class="flex flex-col h-full">

        <div class="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800">
          <i class='bx bx-info-circle text-cyan-500'></i> Weather Details
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          
          ${[{icon:"bxs-sun",label:"Feels Like",value:`${e.main.feels_like.toFixed(1)}°C`},{icon:"bx-droplet",label:"Humidity",value:`${e.main.humidity}%`},{icon:"bx-bar-chart-alt-2",label:"Pressure",value:`${e.main.pressure} mb`},{icon:"bx-wind",label:"Wind",value:`${(e.wind.speed*3.6).toFixed(1)} Km/H`},{icon:"bx-cloud-rain",label:"Precipitation",value:`${o.toFixed(1)} mm`},{icon:"bx-water",label:"Rain Chance",value:`${t}%`},{icon:"bxs-sun",label:"Sunrise",value:n},{icon:"bxs-moon",label:"Sunset",value:i}].map(a=>`
            <div class="flex items-center gap-2 p-2 bg-white/70 rounded-xl shadow-sm hover:shadow-md transition">
              <i class='bx ${a.icon} text-cyan-500 text-xl flex-shrink-0'></i>
              <div>
                <p class="text-gray-600 text-xs md:text-sm font-medium">${a.label}</p>
                <p class="text-gray-900 font-bold text-sm md:text-base">${a.value}</p>
              </div>
            </div>
          `).join("")}
          
        </div>
      </div>
      
      `})}function M(e,n){const i=e.main.temp,o=e.wind.speed,s=e.wind.gust??0,t=e.main.humidity;e.weather[0].main.toLowerCase();const a=e.rain&&e.rain["1h"]||0,l=0,c=e.clouds?.all??0,r=[];a>15&&r.push("Heavy rainfall detected — ensure drainage, delay fertilizer application, and protect crops from standing water."),t<30&&i>30&&a===0&&r.push("Very dry and hot conditions — increase irrigation frequency and apply mulch to reduce water loss."),t>85&&i>15&&i<30&&r.push("Warm and humid conditions favour fungal/bacterial diseases — inspect crops for leaf spots, blight, and ensure good ventilation."),o>12&&a>5&&r.push("High winds and rainfall — tall crops may lodge, secure equipment, delay spraying operations."),i>35&&r.push("Extreme heat warning — provide shade for livestock, increase irrigation, and monitor crops for heat stress."),i<2&&r.push("Frost or freezing risk — cover sensitive crops, harvest early if possible, protect from cold damage."),c>80&&i>20&&a>0&&r.push("Heavy cloud cover and rain during flowering/pollination can reduce yield and quality — consider delaying operations or adjusting crop management."),o<3&&a>10&&r.push("Rainfall with minimal wind may result in poor drying conditions and water‑logging — ensure fields drain properly."),s>15&&r.push("High wind gusts detected — risk of lodging, crop breakage and spray drift; secure structures and postpone sensitive operations."),t<25&&i>20&&i<30&&r.push("Very low humidity with moderate temperature — crops may lose moisture quickly, increase irrigation or shade where possible."),a>5&&t>80&&r.push("Rain and high humidity together increase risk of fungal diseases and nutrient leaching — monitor soil fertility and crop health."),e.main.temp_min<5&&i>20&&r.push("Sudden drop in night temperature following warm day — risk of crop stress and frost pockets, especially in low‑lying fields."),i>33&&o>10&&t<30&&r.push("Hot, windy and dry conditions — elevated risk of fire in crop residues or pastures; clear debris and monitor flammable zones."),a>20&&r.push("Excessive rainfall — soil erosion and nutrient loss likely, implement soil conservation practices and secure vulnerable slopes."),t>80&&o<2&&a>2&&r.push("Stagnant humid air with light rain — increased pest and disease pressure; inspect crops and consider ventilation or treatment."),a>8&&o<4&&r.push("Fields could become muddy and inaccessible — postpone harvesting or planting to avoid soil compaction and yield loss."),c<10&&i>30&&t<50&&r.push("Clear skies with high temperature and low humidity — risk of heat stress on crops and livestock; provide shade and adequate water."),a===0&&l<20&&t<40&&i>22&&r.push("No rain expected and high transpiration demand — schedule irrigation and monitor soil moisture carefully."),o>20&&a>30&&r.push("Severe storm/typhoon conditions — major risk of crop damage, flooding and infrastructure failure; evacuate equipment and implement emergency protocols."),a>3&&c>70&&i>18&&r.push("Low light and moderate rainfall during planting/early germination stage — risk of poor seed emergence; ensure field drainage and consider delayed sowing."),r.length===0&&r.push("Conditions are generally favourable — good day for field work and crop maintenance.");const w=r.map($=>`<p class="text-gray-700 mb-2">• ${$}</p>`).join("");H.innerHTML=`
    <i class='bx bx-info-circle text-3xl text-amber-500 flex-shrink-0 mt-1'></i>
    <div class="flex-1">
      <div class="font-bold text-gray-900 mb-2">🌾 Farming Advisory</div>
      ${w}
    </div>
  `}function D(e,n){fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${e}&lon=${n}&appid=${p}&units=metric`).then(i=>i.json()).then(i=>{f.innerHTML="";const o=new Date().toISOString().split("T")[0];i.list.filter(t=>t.dt_txt.startsWith(o)).forEach(t=>{const a=new Date(t.dt*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),l=t.main.temp.toFixed(0),c=`https://openweathermap.org/img/wn/${t.weather[0].icon}.png`,r=t.pop?(t.pop*100).toFixed(0):"0";f.innerHTML+=`
  <div class="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 w-full text-center hover:shadow-md hover:-translate-y-1 transition-all">
      <div class="font-bold text-gray-700 mb-2 text-sm">${a}</div>
      <img src="${c}" alt="${t.weather[0].description}" class="w-10 h-10 mx-auto">
      <div class="text-xl font-bold text-blue-600 mb-2">${l}°C</div>
      <div class="text-cyan-600 text-sm">🌧️ ${r}%</div>
  </div>
`})}).catch(i=>console.error("Error fetching hourly forecast:",i))}function P(e,n){fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${e}&lon=${n}&appid=${p}&units=metric`).then(i=>i.json()).then(i=>{x.innerHTML="";const o={};i.list.forEach(t=>{const a=t.dt_txt.split(" ")[0];if(o[a])o[a].minTemp=Math.min(o[a].minTemp,t.main.temp_min),o[a].maxTemp=Math.max(o[a].maxTemp,t.main.temp_max),t.pop>o[a].rainChance&&(o[a].rainChance=t.pop),t.rain&&t.rain["3h"]&&(o[a].precipitation+=t.rain["3h"]);else{const l=y(t.weather[0].description);let c=t.pop?(t.pop*100).toFixed(0):"0";c<1&&(c="0");const r=t.rain?t.rain["3h"]:0;o[a]={minTemp:t.main.temp_min,maxTemp:t.main.temp_max,weather:l.text,icon:l.image,rainChance:c,precipitation:r,fullDate:new Date(t.dt_txt)}}}),Object.values(o).slice(0,7).forEach(t=>{const a={weekday:"short",month:"short",day:"numeric"},l=t.fullDate.toLocaleDateString("en-US",a);x.innerHTML+=`
                      <div class="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-5 text-center hover:shadow-md hover:-translate-y-2 transition-all cursor-pointer">
                        <div class="font-bold text-gray-600 mb-3 text-sm">${l}</div>
                        <img src="${t.icon}" alt="${t.weather}" class="w-12 h-12 mx-auto mb-2">
                        <div class="text-gray-700 text-sm mb-2">${t.weather}</div>
                        <div class="flex justify-center gap-1 font-bold mb-2">
                          <span class="text-blue-600">${t.maxTemp.toFixed(0)}°</span>
                          <span class="text-gray-500">/ ${t.minTemp.toFixed(0)}°</span>
                        </div>
                        <div class="text-cyan-600 text-xs mb-1">🌧️ ${t.rainChance}%</div>
                        <div class="text-gray-600 text-xs">💧 ${t.precipitation.toFixed(1)}mm</div>
                      </div>
                    `})})}function y(e){return{"clear sky":{text:"Clear Sky",image:"/images/v1/sunny.png"},"few clouds":{text:"Mostly Sunny",image:"/images/v1/sunny_s_cloudy.png"},"scattered clouds":{text:"Partly Cloudy",image:"/images/v1/partly_cloudy.png"},"broken clouds":{text:"Cloudy",image:"/images/v1/cloudy_s_sunny.png"},"overcast clouds":{text:"Overcast",image:"/images/v1/cloudy.png"},"light rain":{text:"Light Rain",image:"/images/v1/rain_light.png"},"moderate rain":{text:"Moderate Rain",image:"/images/v1/rain.png"},"heavy intensity rain":{text:"Heavy Rain",image:"/images/v1/rain_heavy.png"},thunderstorm:{text:"⚡ Thunderstorm",image:"/images/v1/thunderstorms.png"}}[e.toLowerCase()]||{text:e,image:"/images/v1/default.png"}}const _=3,d=JSON.parse(localStorage.getItem("pinnedLocations"))||[],g=document.getElementById("pinnedLocations");function m(e,n){return d.some(i=>i.lat===e&&i.lon===n)}function v(){localStorage.setItem("pinnedLocations",JSON.stringify(d)),b()}function j(e,n,i){if(d.length>=_){alert("You have reached the maximum of 3 pinned locations.");return}if(m(n,i)){alert("Location is already pinned!");return}d.push({name:e,lat:n,lon:i}),v()}function B(e,n){const i=d.findIndex(o=>o.lat===e&&o.lon===n);i!==-1&&(d.splice(i,1),v())}function b(){if(g.innerHTML="",d.length===0){g.innerHTML=`<div class="col-span-full text-center py-12 text-gray-600">
         <i class="bx bx-map-pin text-5xl mb-4 text-cyan-400 opacity-50"></i>
         <p class="text-lg">No locations pinned yet. Pin a location to save it!</p>
       </div>`;return}d.forEach(e=>{const n=document.createElement("div");n.classList.add("bg-white/70","backdrop-blur-md","border","border-blue-200","rounded-xl","p-3","flex","items-center","justify-between","gap-2","hover:shadow-md","transition-all","cursor-pointer"),n.innerHTML=`
      <div class="flex items-center gap-2">
        <i class='bx bx-map-pin text-cyan-500 text-2xl'></i>
        <span class="font-medium text-gray-800 text-sm">${e.name}</span>
      </div>
      <div class="flex items-center gap-1">
        <i onclick="getWeatherByCoords(${e.lat}, ${e.lon})" class='bx bx-calendar text-gray-500 hover:text-cyan-500 text-xl'></i>
        <i onclick="removePinnedLocation(${e.lat}, ${e.lon})" class='bx bx-trash text-red-500 hover:text-red-600 text-xl'></i>
      </div>
    `,g.appendChild(n)})}document.addEventListener("DOMContentLoaded",b);window.pinLocation=j;window.removePinnedLocation=B;window.getWeatherByCoords=h;window.isPinned=m;
