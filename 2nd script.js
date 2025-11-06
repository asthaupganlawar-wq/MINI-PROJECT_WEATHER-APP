async function fetchWeather() {
  const city = document.getElementById('city').value;
  const apiKey = "bd02b46d7c075253d2a631ef3f3c7914"; // replace with OpenWeatherMap API key

  if (!city) {
    alert("Please enter a city name!");
    return;
  }

  const res = await fetch('https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric');
  const data = await res.json();

  if (data.cod !== 200) {
    alert("City not found!");
    return;
  }

  const record = {
    city: data.name,
    temperature: data.main.temp,
    condition: data.weather[0].description
  };

  saveWeather(record);
  displayWeather();
}

function saveWeather(record) {
  let weatherData = JSON.parse(localStorage.getItem('weatherData')) || [];
  weatherData.push(record);
  localStorage.setItem('weatherData', JSON.stringify(weatherData));
}

function displayWeather() {
  const tableBody = document.querySelector("#weatherTable tbody");
  const weatherData = JSON.parse(localStorage.getItem('weatherData')) || [];
  tableBody.innerHTML = "";

  weatherData.forEach((rec, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${rec.city}</td>
        <td>${rec.temperature}</td>
        <td>${rec.condition}</td>
        <td>
          <button onclick="updateWeather(${index})">✏</button>
          <button onclick="deleteWeather(${index})">🗑</button>
        </td>
      </tr>`;
  });
}

function updateWeather(index) {
  const weatherData = JSON.parse(localStorage.getItem('weatherData')) || [];
  const newTemp = prompt("Enter new temperature:", weatherData[index].temperature);
  if (newTemp !== null) {
    weatherData[index].temperature = newTemp;
    localStorage.setItem('weatherData', JSON.stringify(weatherData));
    displayWeather();
  }
}

function deleteWeather(index) {
  let weatherData = JSON.parse(localStorage.getItem('weatherData')) || [];
  weatherData.splice(index, 1);
  localStorage.setItem('weatherData', JSON.stringify(weatherData));
  displayWeather();
}

// Load data on startup
displayWeather();