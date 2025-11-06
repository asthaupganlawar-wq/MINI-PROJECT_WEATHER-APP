const API_KEY = "20da423906ccf27bec8c2d81c8f4a2eb"; // Replace with your OpenWeatherMap API key
if(!city) return alert('Enter a city name');
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
const res = await fetch(url);
if(!res.ok) return alert('City not found');
const data = await res.json();


currentData = {
city: data.name,
country: data.sys.country,
temp: data.main.temp,
humidity: data.main.humidity,
wind: data.wind.speed,
description: data.weather[0].description,
icon: data.weather[0].icon
};


renderWeather(currentData);


function renderWeather(w) {
infoBox.classList.remove('hidden');
iconEl.innerHTML = `<img src="https://openweathermap.org/img/wn/${w.icon}@2x.png">`;
tempEl.textContent = `${w.temp.toFixed(1)}°C`;
descEl.textContent = `${w.city}, ${w.country} — ${w.description}`;
detailsEl.innerHTML = `
<div>Humidity: ${w.humidity}%</div>
<div>Wind: ${w.wind} m/s</div>
`;
}


saveBtn.onclick = async () => {
if(!currentData) return alert('No data to save');
const res = await fetch('/api/cities', {
method: 'POST',
headers: {'Content-Type': 'application/json'},
body: JSON.stringify(currentData)
});
if(res.ok) loadSaved();
};


exportBtn.onclick = () => {
window.open('/api/export/xml', '_blank');
};


async function loadSaved() {
const res = await fetch('/api/cities');
const cities = await res.json();
savedList.innerHTML = cities.map(c => `
<div class='saved-item'>
<span>${c.city}, ${c.country}</span>
<button onclick="deleteCity('${c.id}')">Delete</button>
</div>
`).join('');
}


async function deleteCity(id) {
await fetch(`/api/cities/${id}`, { method: 'DELETE' });
loadSaved();
}


loadSaved();