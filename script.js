function getWeather() {
  const apiKey = "958e5265e9df01373c6c3509bed88727";
  const city = document.getElementById("city-input").value;

  if (!city) {
    alert("Please enter a city");
    return;
  }

  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

  fetch(currentWeatherUrl)
    .then((response) => response.json())
    .then((data) => {
      displayWeather(data);
    })
    .catch((error) => {
      console.error("Error fetching current weather data:", error);
      alert("Error fetching current weather data. Please try again.");
    });

  fetch(forecastUrl)
    .then((response) => response.json())
    .then((data) => {
      displayHourlyForecast(data.list);
    })
    .catch((error) => {
      console.error("Error fetching hourly forecast data:", error);
      alert("Error fetching hourly forecast data. Please try again.");
    });
}

function displayWeather(data) {
  const tempDivInfo = document.getElementById("temp-div");
  const weatherInfoDiv = document.getElementById("weather-info");
  const weatherIcon = document.getElementById("weather-icon");
  const hourlyForecastDiv = document.getElementById("hourly-forecast");
  const initialImage = document.getElementById("initial-image");

  // Clear previous content
  weatherInfoDiv.innerHTML = "";
  hourlyForecastDiv.innerHTML = "";
  tempDivInfo.innerHTML = "";

  if (data.cod === "404") {
    weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
  } else {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp - 273.15); // Convert to Celsius
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    tempDivInfo.innerHTML = `<p>${temperature}°C</p>`;

    // Fetch wind speed and humidity
    const windSpeed = data.wind.speed;
    const humidity = data.main.humidity;

    // Fetch AQI separately
    getAQI(data.coord.lat, data.coord.lon).then((aqiText) => {
      // Remove any existing recommendation before adding a new one
      document
        .querySelectorAll(".weather-recommendation")
        .forEach((el) => el.remove());

      // Create a new recommendation element
      const recommendationElement = document.createElement("p");
      recommendationElement.textContent = getWeatherRecommendation(
        description,
        temperature
      );
      recommendationElement.classList.add("weather-recommendation");

      // Place it ABOVE the weather details box
      weatherInfoDiv.before(recommendationElement);

      // Set weather details inside the box
      weatherInfoDiv.innerHTML = `
        <p><strong>${cityName}</strong> | 
        ${description} | 
        🌬️ Wind: ${windSpeed} m/s | 
        💧 Humidity: ${humidity}% | 
        🌍 AQI: ${aqiText}</p>
      `;
    });

    weatherIcon.src = iconUrl;
    weatherIcon.alt = description;
    weatherIcon.style.display = "block";

    initialImage.style.display = "none";
  }
}

async function getAQI(lat, lon) {
  try {
    let aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=YOUR_OPENWEATHER_API_KEY`;
    let aqiResponse = await fetch(aqiUrl);
    let aqiData = await aqiResponse.json();

    let aqiValue = aqiData.list[0].main.aqi;
    return getAQIDescription(aqiValue);
  } catch (error) {
    console.error("Error fetching AQI:", error);
    return "N/A";
  }
}

// Function to convert AQI value to text
function getAQIDescription(aqi) {
  if (aqi === 1) return "Good ✅";
  if (aqi === 2) return "Fair 😊";
  if (aqi === 3) return "Moderate 😐";
  if (aqi === 4) return "Poor ⚠️";
  if (aqi === 5) return "Very Poor ❌";
  return "Unknown";
}

// ✅ Function to Generate Recommendations
function getWeatherRecommendation(weatherCondition, temp) {
  if (temp > 30) return "It's quite hot! Stay hydrated. 🔥";
  if (temp < 10) return "It's cold! Wear warm clothes. 🧥";

  // Weather condition-based suggestions
  if (weatherCondition.includes("clear")) {
    return "It's sunny! Wear sunglasses and stay hydrated. ☀️";
  }
  if (weatherCondition.includes("rain")) {
    return "Don't forget your umbrella! ☔";
  }
  if (weatherCondition.includes("cloud")) {
    return "It’s cloudy! A light jacket might be helpful. 🌥";
  }
  if (weatherCondition.includes("snow")) {
    return "It's snowing! Wear warm clothes and be careful outside. ❄️";
  }

  // If none of the above conditions match
  return `The weather in ${city} is currently ${weatherCondition}.`;
}

function displayHourlyForecast(hourlyData) {
  const hourlyForecastDiv = document.getElementById("hourly-forecast");
  hourlyForecastDiv.innerHTML = ""; // Clear previous forecast data

  const next24Hours = hourlyData.slice(0, 8); // Display the next 24 hours (3-hour intervals)

  next24Hours.forEach((item) => {
    const dateTime = new Date(item.dt * 1000); // Convert timestamp to milliseconds
    const hour = dateTime.getHours();
    const temperature = Math.round(item.main.temp - 273.15); // Convert to Celsius
    const iconCode = item.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // Use @2x for better sizing

    const hourlyItemHtml = `
      <div class="hourly-item">
          <span>${hour}:00</span>
          <img src="${iconUrl}" alt="Weather Icon" class="weather-icon-small">
          <span>${temperature}°C</span>
      </div>
    `;

    hourlyForecastDiv.innerHTML += hourlyItemHtml;
  });
}

const recognition = new webkitSpeechRecognition();
recognition.onresult = function (event) {
  document.getElementById("city").value = event.results[0][0].transcript;
  getWeather();
};
document.getElementById("voice-search").addEventListener("click", () => {
  recognition.start();
});

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const apiKey = "958e5265e9df01373c6c3509bed88727";
        const geoUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        try {
          const response = await fetch(geoUrl);
          const data = await response.json();

          if (data.name) {
            document.getElementById("city-input").value = data.name;
          }

          fetchWeatherByCoords(lat, lon);
        } catch (error) {
          console.error("Error fetching city name:", error);
        }
      },
      (error) => {
        alert("Location access denied. Please enter a city manually.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

async function fetchWeatherByCoords(lat, lon) {
  const apiKey = "958e5265e9df01373c6c3509bed88727";
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  try {
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    displayWeather(weatherData);

    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();
    displayHourlyForecast(forecastData.list);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Error fetching weather data. Please try again.");
  }
}

//Chatbot
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("send-button").addEventListener("click", sendMessage);
  document
    .getElementById("chat-input")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        sendMessage();
      }
    });

  startChat();
});

// Show/Hide Chatbot
function toggleChatbot() {
  let chatbot = document.getElementById("chatbot-container");
  let toggleButton = document.getElementById("chatbot-toggle");

  if (chatbot.style.display === "none" || chatbot.style.display === "") {
    chatbot.style.display = "flex";
    toggleButton.style.display = "none"; // Hide button when chatbot is open
  } else {
    chatbot.style.display = "none";
    toggleButton.style.display = "block"; // Show button when chatbot is closed
  }
}

// Function to Start Chat with a Welcome Message
function startChat() {
  setTimeout(() => {
    addMessage(
      "Hello! I'm your Weather Assistant. Feel free to ask me questions about the weather and get weather-related recommendations for any location worldwide. \nHow can I assist you today? You can start by asking about the weather in a specific location!",
      "bot"
    );
  }, 500);
}

// Function to Add Messages to Chat
function addMessage(text, sender) {
  let chatbox = document.getElementById("chatbox");
  let messageDiv = document.createElement("div");

  messageDiv.textContent = text;
  messageDiv.style.padding = "8px";
  messageDiv.style.margin = "5px 0";

  if (sender === "user") {
    messageDiv.style.textAlign = "right";
    messageDiv.style.color = "blue";
  } else {
    messageDiv.style.textAlign = "left";
    messageDiv.style.color = "black";
  }

  chatbox.appendChild(messageDiv);
  chatbox.scrollTop = chatbox.scrollHeight; // Auto-scroll to latest message
}

// Function to Handle Responses
async function getChatbotResponse(userMessage) {
  userMessage = userMessage.toLowerCase().trim();

  // Default Questions
  if (userMessage.includes("how are you"))
    return "I'm just a chatbot, but I'm here to help!";
  if (userMessage.includes("what can you do"))
    return "I can provide weather updates and outfit suggestions!";
  if (userMessage.includes("outfit"))
    return "Wear light clothes if it's hot and warm clothes if it's cold!";

  // Check for weather query format
  const words = userMessage.split(" ");
  if (
    words.includes("weather") ||
    words.includes("temperature") ||
    words.includes("in")
  ) {
    // Extract city name by taking the last word in the message (after "in")
    let city = words.slice(-1).join(" ");
    city = sanitizeCityName(city); // Remove any punctuation from city name
    return await getWeatherForCity(city);
  }

  // General fallback if message doesn't match known patterns
  return "I didn't understand that. Please try asking about the weather or outfit suggestions!";
}

// Sanitize the city name by removing punctuation and unwanted characters
function sanitizeCityName(city) {
  return city.replace(/[^a-zA-Z ]/g, "").trim(); // Removes anything that's not a letter or space
}

// Fetch Weather Data
async function getWeatherForCity(city) {
  const apiKey = "958e5265e9df01373c6c3509bed88727"; // Replace with a valid API key
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    let response = await fetch(url);
    let data = await response.json();

    if (data.cod === 200) {
      return `The weather in ${city} is ${data.weather[0].description}, with a temperature of ${data.main.temp}°C.`;
    } else {
      return `I couldn't find weather data for "${city}". Please check the city name or try again.`;
    }
  } catch (error) {
    return "Sorry, I couldn't fetch the weather details. Please try again later!";
  }
}

// Send Message & Get Response
async function sendMessage() {
  let inputField = document.getElementById("chat-input");
  let message = inputField.value.trim();

  if (message === "") return;

  addMessage("You: " + message, "user");

  setTimeout(async () => {
    let botReply = await getChatbotResponse(message);
    addMessage("Bot: " + botReply, "bot");
  }, 1000);

  inputField.value = ""; // Clear input field
}

async function getAQI(lat, lon) {
  try {
    let aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=958e5265e9df01373c6c3509bed88727`;
    let aqiResponse = await fetch(aqiUrl);
    let aqiData = await aqiResponse.json();

    let aqiValue = aqiData.list[0].main.aqi;
    return getAQIDescription(aqiValue);
  } catch (error) {
    console.error("Error fetching AQI:", error);
    return "N/A";
  }
}

// Function to convert AQI value to text
function getAQIDescription(aqi) {
  if (aqi === 1) return "Good ✅";
  if (aqi === 2) return "Fair 😊";
  if (aqi === 3) return "Moderate 😐";
  if (aqi === 4) return "Poor ⚠️";
  if (aqi === 5) return "Very Poor ❌";
  return "Unknown";
}

//name
// script.js
window.onload = function () {
  // Show the popup on page load
  document.getElementById("popup").style.display = "flex";
};

// script.js

// Function to handle the submission of the name
function submitName() {
  const userName = document.getElementById("userNameInput").value;

  if (userName) {
    // Update the welcome message with the user's name
    document.getElementById(
      "welcomeMessage"
    ).textContent = `Welcome, ${userName}!`;
    document.getElementById("welcomeMessage").style.display = "block"; // Show the welcome message
    document.getElementById("popup").style.display = "none"; // Close the popup
  } else {
    alert("Please enter your name.");
  }
}

// Add event listener for the 'Enter' key press to submit the form
document
  .getElementById("userNameInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      submitName();
    }
  });
