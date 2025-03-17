const API_KEY = 'be25870215fbfab18ec7e9b2ddedc858';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// DOM Elements
const countrySelect = document.getElementById('country-select');
const citySelect = document.getElementById('city-select');
const themeToggle = document.getElementById('theme-toggle');
const currentTemp = document.getElementById('current-temp');
const weatherDescription = document.getElementById('weather-description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const currentWeatherIcon = document.getElementById('current-weather-icon');
const forecastContainer = document.getElementById('forecast-container');

// Theme handling
let isDarkTheme = false;

themeToggle.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme');
    themeToggle.innerHTML = isDarkTheme ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Validate API key before proceeding
async function validateApiKey() {
    try {
        const response = await fetch(`${BASE_URL}/weather?q=London&appid=${API_KEY}`);
        if (response.status === 401) {
            throw new Error('Invalid API key. Please obtain a valid key from OpenWeatherMap.');
        }
        return true;
    } catch (error) {
        const message = error.message.includes('Invalid API key') ? 
            'Invalid API key detected. Please follow these steps:\n\n' +
            '1. Visit https://openweathermap.org/api\n' +
            '2. Sign up for a free account\n' +
            '3. Get your API key from your account page\n' +
            '4. Replace the API_KEY constant in the code with your new key\n' +
            '5. Wait up to 2 hours for the key to activate' :
            'Error connecting to weather service. Please check your internet connection.';
        
        alert(message);
        disableWeatherFeatures();
        return false;
    }
}

// Disable weather features when API key is invalid
function disableWeatherFeatures() {
    countrySelect.disabled = true;
    citySelect.disabled = true;
    countrySelect.innerHTML = '<option value="">Weather service unavailable</option>';
    citySelect.innerHTML = '<option value="">Weather service unavailable</option>';
    clearWeatherDisplay();
    clearForecastDisplay();
    weatherDescription.textContent = 'Weather service unavailable - Invalid API key';
}

// Fetch countries data
async function fetchCountries() {
    try {
        // Clear existing options
        countrySelect.innerHTML = '<option value="">Select Country</option>';
        
        // Define the five countries
        const countries = [
            { code: 'DE', name: 'Germany' },
            { code: 'FR', name: 'France' },
            { code: 'FI', name: 'Finland' },
            { code: 'EE', name: 'Estonia' },
            { code: 'SE', name: 'Sweden' }
        ];

        // Add countries to select element
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.code;
            option.textContent = country.name;
            countrySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error setting up countries:', error);
        alert('Error loading countries. Please try again later.');
    }
}

// Fetch cities for selected country
async function fetchCities(countryCode) {
    if (!countryCode) {
        citySelect.innerHTML = '<option value="">Select Country First</option>';
        citySelect.disabled = true;
        return;
    }

    citySelect.innerHTML = '<option value="">Loading cities...</option>';
    citySelect.disabled = true;
    
    try {
        const majorCities = await fetchMajorCities(countryCode);
        
        // Reset the select element
        citySelect.innerHTML = '<option value="">Select City</option>';

        if (!majorCities || majorCities.length === 0) {
            citySelect.innerHTML = '<option value="">No cities found for this country</option>';
            return;
        }

        majorCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.name;
            option.textContent = city.name;
            option.dataset.lat = city.lat;
            option.dataset.lon = city.lon;
            citySelect.appendChild(option);
        });

        console.log(`Successfully loaded ${majorCities.length} cities for ${countryCode}`);

    } catch (error) {
        console.error('Error in fetchCities:', error);
        
        let errorMessage = 'Error loading cities - Please try again';
        
        if (error.message.includes('Invalid API key')) {
            disableWeatherFeatures();
            errorMessage = 'Weather service unavailable - Invalid API key';
        } else if (error.message.includes('No cities found')) {
            errorMessage = 'No cities found for this country';
        }
        
        citySelect.innerHTML = `<option value="">${errorMessage}</option>`;
    } finally {
        citySelect.disabled = false;
    }
}

// Helper function to fetch major cities using a different approach
async function fetchMajorCities(countryCode) {
    try {
        const cities = new Map();

        // Define major cities for each country
        const majorCities = {
            'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt'],
            'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'],
            'FI': ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu'],
            'EE': ['Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Kohtla-Järve'],
            'SE': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås']
        };

        // Fetch weather data for each major city
        for (const cityName of majorCities[countryCode]) {
            try {
                const response = await fetch(`${BASE_URL}/weather?q=${cityName},${countryCode}&appid=${API_KEY}&units=metric`);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.cod === 200) {
                        const cityKey = `${data.name.toLowerCase()}-${data.coord.lat}-${data.coord.lon}`;
                        cities.set(cityKey, {
                            name: data.name,
                            lat: data.coord.lat,
                            lon: data.coord.lon
                        });
                    }
                }
            } catch (error) {
                console.error(`Error fetching data for ${cityName}:`, error);
                // Continue with next city even if one fails
            }
        }

        // If we have cities, return them
        if (cities.size > 0) {
            const cityList = Array.from(cities.values())
                .sort((a, b) => a.name.localeCompare(b.name));
            
            console.log(`Found ${cityList.length} cities for country ${countryCode}`);
            return cityList;
        }

        // Fallback: Try to get at least the capital city
        const capitalCities = {
            'DE': 'Berlin',
            'FR': 'Paris',
            'FI': 'Helsinki',
            'EE': 'Tallinn',
            'SE': 'Stockholm'
        };

        const capitalResponse = await fetch(`${BASE_URL}/weather?q=${capitalCities[countryCode]},${countryCode}&appid=${API_KEY}&units=metric`);
        
        if (capitalResponse.ok) {
            const data = await capitalResponse.json();
            if (data.cod === 200) {
                return [{
                    name: data.name,
                    lat: data.coord.lat,
                    lon: data.coord.lon
                }];
            }
        }

        throw new Error('No cities found for this country');

    } catch (error) {
        console.error('Error fetching major cities:', error);
        throw error;
    }
}

// Fetch current weather
async function fetchCurrentWeather(city, countryCode) {
    try {
        // Show loading state
        currentTemp.textContent = 'Loading...';
        weatherDescription.textContent = 'Loading...';
        humidity.textContent = 'Loading...';
        windSpeed.textContent = 'Loading...';
        currentWeatherIcon.src = ''; // Clear the icon while loading
        
        // Hide the weather icon container while loading
        const weatherIconContainer = document.querySelector('.weather-icon');
        weatherIconContainer.classList.remove('visible');
        
        const selectedOption = citySelect.options[citySelect.selectedIndex];
        let url;
        
        // If we have coordinates, use them for more accurate results
        if (selectedOption.dataset.lat && selectedOption.dataset.lon) {
            url = `${BASE_URL}/weather?lat=${selectedOption.dataset.lat}&lon=${selectedOption.dataset.lon}&appid=${API_KEY}&units=metric`;
        } else {
            // Fallback to city,country search
            const encodedCity = encodeURIComponent(city.trim());
            const encodedCountry = encodeURIComponent(countryCode.trim());
            url = `${BASE_URL}/weather?q=${encodedCity},${encodedCountry}&appid=${API_KEY}&units=metric`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.cod === 200) {
            // Update weather information with animation
            currentTemp.textContent = Math.round(data.main.temp);
            weatherDescription.textContent = data.weather[0].description;
            humidity.textContent = data.main.humidity;
            windSpeed.textContent = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
            
            // Update weather icon with animation
            const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
            currentWeatherIcon.src = iconUrl;
            
            // Show the weather icon with animation
            weatherIconContainer.classList.add('visible');
            
            // Add hover effect based on weather condition
            weatherIconContainer.style.background = getWeatherBackground(data.weather[0].main);
        } else {
            throw new Error(data.message || 'Failed to fetch weather data');
        }
    } catch (error) {
        console.error('Error fetching current weather:', error);
        clearWeatherDisplay();
        alert(`Error loading current weather: ${error.message}`);
    }
}

// Helper function to get background color based on weather condition
function getWeatherBackground(weatherMain) {
    const backgrounds = {
        'Clear': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'Clouds': 'linear-gradient(135deg, rgba(200, 200, 200, 0.1), rgba(150, 150, 150, 0.05))',
        'Rain': 'linear-gradient(135deg, rgba(100, 150, 255, 0.1), rgba(50, 100, 200, 0.05))',
        'Snow': 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(200, 200, 255, 0.1))',
        'Thunderstorm': 'linear-gradient(135deg, rgba(50, 50, 100, 0.2), rgba(30, 30, 80, 0.1))',
        'Drizzle': 'linear-gradient(135deg, rgba(150, 200, 255, 0.1), rgba(100, 150, 200, 0.05))',
        'Mist': 'linear-gradient(135deg, rgba(200, 200, 200, 0.15), rgba(150, 150, 150, 0.1))',
        'default': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
    };
    
    return backgrounds[weatherMain] || backgrounds.default;
}

// Fetch 3-day forecast
async function fetchForecast(city, countryCode) {
    try {
        // Show loading state
        forecastContainer.innerHTML = '<div class="forecast-item">Loading forecast data...</div>';
        
        const selectedOption = citySelect.options[citySelect.selectedIndex];
        let url;
        
        // If we have coordinates, use them for more accurate results
        if (selectedOption.dataset.lat && selectedOption.dataset.lon) {
            url = `${BASE_URL}/forecast?lat=${selectedOption.dataset.lat}&lon=${selectedOption.dataset.lon}&appid=${API_KEY}&units=metric`;
        } else {
            // Fallback to city,country search
            const encodedCity = encodeURIComponent(city.trim());
            const encodedCountry = encodeURIComponent(countryCode.trim());
            url = `${BASE_URL}/forecast?q=${encodedCity},${encodedCountry}&appid=${API_KEY}&units=metric`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Forecast API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.cod === "200" && Array.isArray(data.list) && data.list.length > 0) {
            forecastContainer.innerHTML = '';
            const dailyForecasts = new Map();
            const today = new Date().setHours(0, 0, 0, 0);
            
            // Group forecasts by day, excluding today
            data.list.forEach(forecast => {
                const forecastDate = new Date(forecast.dt * 1000);
                const dateKey = forecastDate.setHours(0, 0, 0, 0);
                
                if (dateKey > today && !dailyForecasts.has(dateKey)) {
                    dailyForecasts.set(dateKey, forecast);
                }
            });
            
            // Get first 3 days of forecast
            const forecastArray = Array.from(dailyForecasts.values());
            
            if (forecastArray.length === 0) {
                throw new Error('No forecast data available');
            }
            
            forecastArray.slice(0, 3).forEach(forecast => {
                const date = new Date(forecast.dt * 1000);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                const forecastItem = document.createElement('div');
                forecastItem.className = 'forecast-item';
                forecastItem.innerHTML = `
                    <div class="forecast-date">${dayName}, ${dateStr}</div>
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather icon">
                    <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
                    <div class="forecast-description">${forecast.weather[0].description}</div>
                `;
                forecastContainer.appendChild(forecastItem);
            });
        } else {
            throw new Error(data.message || 'Failed to fetch forecast data');
        }
    } catch (error) {
        console.error('Error fetching forecast:', error);
        clearForecastDisplay();
        alert(`Error loading forecast: ${error.message}`);
    }
}

// Helper function to clear weather display
function clearWeatherDisplay() {
    currentTemp.textContent = '--';
    weatherDescription.textContent = 'No data available';
    humidity.textContent = '--';
    windSpeed.textContent = '--';
    currentWeatherIcon.src = '';
    
    // Hide the weather icon
    const weatherIconContainer = document.querySelector('.weather-icon');
    weatherIconContainer.classList.remove('visible');
    weatherIconContainer.style.background = 'rgba(255, 255, 255, 0.1)';
}

// Helper function to clear forecast display
function clearForecastDisplay() {
    forecastContainer.innerHTML = '<div class="forecast-item">No forecast data available</div>';
}

// Event Listeners
countrySelect.addEventListener('change', (e) => {
    citySelect.value = '';
    clearWeatherDisplay();
    clearForecastDisplay();
    
    if (e.target.value) {
        fetchCities(e.target.value);
    } else {
        citySelect.innerHTML = '<option value="">Select Country First</option>';
        citySelect.disabled = true;
    }
});

citySelect.addEventListener('change', (e) => {
    clearWeatherDisplay();
    clearForecastDisplay();
    
    if (e.target.value && countrySelect.value) {
        fetchCurrentWeather(e.target.value, countrySelect.value);
        fetchForecast(e.target.value, countrySelect.value);
    }
});

// Initialize the app
async function initializeApp() {
    const isValidKey = await validateApiKey();
    if (isValidKey) {
        fetchCountries();
    }
}

// Start the application
initializeApp(); 