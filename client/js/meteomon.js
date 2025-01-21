let socket = null;

function showLoadingIndicator(show) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (show) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

function waitForTurnstileResponse() {
    // Polling until the Turnstile token is generated
    const interval = setInterval(() => {
        const tokenElement = document.querySelector("[name='cf-turnstile-response']");
        const token = tokenElement ? tokenElement.value : null;

        if (token) {
            clearInterval(interval); // Stop polling
            console.log("Turnstile token received:", token);
            openWebSocket(token); // Open the WebSocket with the token
        }
    }, 100); // Check every 100ms
}

function openWebSocket(token) {
    if (!token) {
        console.error("Cannot open WebSocket: Token is null");
        showLoadingIndicator(false);
        return;
    }

    socket = new WebSocket(`wss://meteomon.antartica.pro/?token=${encodeURIComponent(token)}`);

    socket.onopen = () => {
        console.log("Connected to Antarctica Data Server Provider.");
        showLoadingIndicator(false); // Hide loading indicator
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        document.getElementById('timestamp').textContent = data.timestamp;
        document.getElementById('solar.solar').textContent = `${data.solar_solar} W/m²`;
        document.getElementById('solar.uvi').textContent = data.solar_uvi;

        document.getElementById('wind.gust').textContent = `${data.wind_gust} km/h`;
        document.getElementById('wind.direction').textContent = `${data.wind_direction} °`;
        document.getElementById('wind.speed').textContent = `${data.wind_speed} km/h`;

        document.getElementById('pressure.absolute').textContent = `${data.pressure_absolute} hPa`;
        document.getElementById('pressure.relative').textContent = `${data.pressure_relative} hPa`;

        document.getElementById('rain.hourly').textContent = `${data.rain_hourly} mm`;
        document.getElementById('rain.daily').textContent = `${data.rain_daily} mm`;
        document.getElementById('rain.weekly').textContent = `${data.rain_weekly} mm`;
        document.getElementById('rain.monthly').textContent = `${data.rain_monthly} mm`;
        document.getElementById('rain.yearly').textContent = `${data.rain_yearly} mm`;
        document.getElementById('rain.event').textContent = `${data.rain_event} mm`;
        document.getElementById('rain.rate').textContent = `${data.rain_rate} mm/h`;

        document.getElementById('outdoor.temperature').textContent = `${data.outdoor_temperature} °C`;
        document.getElementById('outdoor.app_temp').textContent = `${data.outdoor_app_temp} °C`;
        document.getElementById('outdoor.feels_like').textContent = `${data.outdoor_feels_like} °C`;
        document.getElementById('outdoor.humidity').textContent = `${data.outdoor_humidity} %`;
        document.getElementById('outdoor.dew_point').textContent = `${data.outdoor_dew_point} °C`;
    };

    socket.onclose = () => {
        console.log("Disconnected from Antarctica Data Server Provider. Refresh to connect again.");
    };

    socket.onerror = (error) => {
        console.error("Connection error:", error);
        showLoadingIndicator(false); // Hide loading indicator in case of error
    };
}

// Show the loading indicator when the page starts
showLoadingIndicator(true);

// Start waiting for Turnstile response
waitForTurnstileResponse();