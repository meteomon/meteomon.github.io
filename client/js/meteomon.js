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
        document.getElementById('solar.solar').textContent = `${data.solar.solar} W/m²`;
        document.getElementById('solar.uvi').textContent = data.solar.uvi;

        document.getElementById('wind.gust').textContent = `${data.wind.gust} km/h`;
        document.getElementById('wind.direction').textContent = `${data.wind.direction} °`;
        document.getElementById('wind.speed').textContent = `${data.wind.speed} km/h`;

        document.getElementById('pressure.absolute').textContent = `${data.pressure.absolute} hPa`;
        document.getElementById('pressure.relative').textContent = `${data.pressure.relative} hPa`;

        document.getElementById('rain.hourly').textContent = `${data.rain.hourly} mm`;
        document.getElementById('rain.daily').textContent = `${data.rain.daily} mm`;
        document.getElementById('rain.weekly').textContent = `${data.rain.weekly} mm`;
        document.getElementById('rain.monthly').textContent = `${data.rain.monthly} mm`;
        document.getElementById('rain.yearly').textContent = `${data.rain.yearly} mm`;
        document.getElementById('rain.event').textContent = `${data.rain.event} mm`;
        document.getElementById('rain.rate').textContent = `${data.rain.rate} mm/h`;

        document.getElementById('outdoor.temperature').textContent = `${data.outdoor.temperature} °C`;
        document.getElementById('outdoor.app_temp').textContent = `${data.outdoor.app_temp} °C`;
        document.getElementById('outdoor.feels_like').textContent = `${data.outdoor.feels_like} °C`;
        document.getElementById('outdoor.humidity').textContent = `${data.outdoor.humidity} %`;
        document.getElementById('outdoor.dew_point').textContent = `${data.outdoor.dew_point} °C`;

        document.getElementById('id').textContent = data.id;
        document.getElementById('timestamp').textContent = data.timestamp;
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