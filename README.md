# Modern Weather App

A responsive weather application that displays current weather conditions and 3-day forecasts for cities worldwide. The application features a clean, modern interface with support for both light and dark themes.

## Features

- Country and city selection from dropdown menus
- Current weather display including:
  - Temperature
  - Weather description
  - Humidity
  - Wind speed
- 3-day weather forecast
- Responsive design that works on both desktop and mobile devices
- Light and dark theme support
- Real-time weather data from OpenWeatherMap API

## Technologies Used

- HTML5
- CSS3 (with CSS Variables for theming)
- JavaScript (ES6+)
- OpenWeatherMap API
- REST Countries API

## How to Use

1. Open `index.html` in a modern web browser
2. Select a country from the dropdown menu
3. Select a city from the populated city dropdown
4. View the current weather and 3-day forecast
5. Toggle between light and dark themes using the theme button in the header

## API Keys

The application uses the OpenWeatherMap API. The API key is already included in the code for demonstration purposes. For a production environment, it's recommended to:

1. Create your own API key at [OpenWeatherMap](https://openweathermap.org/api)
2. Replace the existing API key in `script.js` with your own key
3. Implement proper API key security measures

## Browser Support

The application works in all modern browsers including:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- The application uses the metric system for temperature (Celsius) and wind speed (km/h)
- City selection is limited to major cities per country
- Weather forecasts are updated in real-time when requesting data

## License

This project is open source and available under the MIT License. 