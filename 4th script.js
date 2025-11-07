async function fetchWeather() {
  const city = document.getElementById('city').value.trim();
  const apiKey = "bd02b46d7c075253d2a631ef3f3c7914";

  if (!city) return alert("Please enter a city name!");

  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
  const data = await res.json();
  if (data.cod !== 200) return alert("City not found!");

  const record = {
    city: data.name,
    temperature: data.main.temp,
    condition: data.weather[0].main.toLowerCase(),
    description: data.weather[0].description,
    humidity: data.main.humidity,
    wind: data.wind.speed,
    icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    date: new Date().toLocaleString(),
    timezone: data.timezone
  };

  showLiveWeather(record);
  showCityTime(record.timezone);
  saveWeather(record);
  displayWeather();
  updateTheme(record.condition, record.timezone);
}

function showCityTime(timezone) {
  const timeElem = document.getElementById("cityTime");
  function updateTime() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const cityTime = new Date(utc + timezone * 1000);
    const h = cityTime.getHours().toString().padStart(2, "0");
    const m = cityTime.getMinutes().toString().padStart(2, "0");
    const s = cityTime.getSeconds().toString().padStart(2, "0");
    timeElem.textContent = `🕒 Local Time: ${h}:${m}:${s}`;
  }
  updateTime();
  setInterval(updateTime, 1000);
}

function saveWeather(record) {
  const data = JSON.parse(localStorage.getItem('weatherData')) || [];
  data.push(record);
  localStorage.setItem('weatherData', JSON.stringify(data));
}

// ✅ Displays each card with day or night theme
function displayWeather() {
  const container = document.getElementById("weatherCards");
  const data = JSON.parse(localStorage.getItem('weatherData')) || [];
  container.innerHTML = "";

  data.forEach((rec, i) => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const cityTime = new Date(utc + rec.timezone * 1000);
    const hour = cityTime.getHours();
    const isNight = hour < 6 || hour >= 18;
    const cardTheme = isNight ? "night-card" : "day-card";

    const card = document.createElement("div");
    card.className = `weather-card ${cardTheme}`;
    card.innerHTML = `
      <h4>📍 ${rec.city}</h4>
      <img src="${rec.icon}" alt="icon">
      <p><strong>${rec.temperature}°C</strong></p>
      <p>${rec.description}</p>
      <p>💧 ${rec.humidity}% | 🌬 ${rec.wind} m/s</p>
      <p>🕒 ${rec.date}</p>
      <div class="actions">
        <button class="edit" onclick="updateWeather(${i})">✏ Edit</button>
        <button class="delete" onclick="deleteWeather(${i})">🗑 Delete</button>
      </div>
    `;
    container.appendChild(card);
  });

  container.style.maxHeight = "70vh";
  container.style.overflowY = "auto";
  container.style.scrollBehavior = "smooth";
}

function updateWeather(i) {
  const data = JSON.parse(localStorage.getItem('weatherData')) || [];
  const newTemp = prompt("Enter new temperature:", data[i].temperature);
  if (newTemp !== null) {
    data[i].temperature = newTemp;
    localStorage.setItem('weatherData', JSON.stringify(data));
    displayWeather();
  }
}

function deleteWeather(i) {
  const data = JSON.parse(localStorage.getItem('weatherData')) || [];
  data.splice(i, 1);
  localStorage.setItem('weatherData', JSON.stringify(data));
  displayWeather();
}

function clearAll() {
  if (confirm("Clear all saved records?")) {
    localStorage.removeItem('weatherData');
    displayWeather();
    document.getElementById("liveWeather").innerHTML = '<p id="cityTime"></p>';
    document.getElementById("pageBody").className = "default";
  }
}

function showLiveWeather(r) {
  const div = document.getElementById("liveWeather");
  div.innerHTML = `
    <h3>📍 Weather in ${r.city}</h3>
    <p><strong>${r.temperature}°C</strong> | ${r.description}</p>
    <p>💧 Humidity: ${r.humidity}% | 🌬 Wind: ${r.wind} m/s</p>
    <img src="${r.icon}" alt="icon">
    <p id="cityTime"></p>`;
}

function updateTheme(condition, timezone) {
  const body = document.getElementById("pageBody");
  const effects = document.getElementById("weatherEffects");
  effects.innerHTML = "";

  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityTime = new Date(utc + timezone * 1000);
  const hour = cityTime.getHours();
  let mode = "";

  if (condition.includes("cloud")) {
    mode = "clouds";
    for (let i = 0; i < 5; i++) {
      const cloud = document.createElement("div");
      cloud.className = "cloud";
      const size = 120 + Math.random() * 100;
      cloud.style.width = `${size}px`;
      cloud.style.height = `${size / 3}px`;
      cloud.style.top = `${30 + Math.random() * 150}px`;
      cloud.style.left = `${-300 - Math.random() * 200}px`;
      cloud.style.animationDuration = `${30 + Math.random() * 40}s`;
      effects.appendChild(cloud);
    }
  } else if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunderstorm")) {
    mode = "rain";
    for (let i = 0; i < 150; i++) {
      const drop = document.createElement("div");
      drop.className = "rainDrop";
      drop.style.left = `${Math.random() * 100}vw`;
      drop.style.animationDuration = `${0.7 + Math.random() * 1.3}s`;
      drop.style.top = `${Math.random() * -100}vh`;
      effects.appendChild(drop);
    }
  } else {
    if (hour >= 5 && hour < 8) mode = "sunrise";
    else if (hour >= 8 && hour < 17) mode = "day";
    else if (hour >= 17 && hour < 19) mode = "sunset";
    else mode = "night";
  }

  if (mode === "day" || mode === "sunrise" || mode === "sunset") {
    const sun = document.createElement("div");
    sun.className = "sun";
    effects.appendChild(sun);
  } else if (mode === "night") {
    const moon = document.createElement("div");
    moon.className = "moon";
    effects.appendChild(moon);
    for (let i = 0; i < 80; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.top = `${Math.random() * 100}vh`;
      star.style.left = `${Math.random() * 100}vw`;
      const size = Math.random() * 3 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.animationDuration = `${1 + Math.random() * 2}s`;
      effects.appendChild(star);
    }
  }

  body.className = mode;
}

// Initialize cards on page load
displayWeather();
