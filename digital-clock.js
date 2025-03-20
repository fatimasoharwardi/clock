let is24Hour = false;
let currentTimezone = 'local';

function updateTime() {
    const now = new Date();
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const ampmElement = document.getElementById('ampm');

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    if (!is24Hour) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        ampmElement.textContent = ampm;
        ampmElement.classList.remove('hidden');
    } else {
        hours = hours.toString().padStart(2, '0');
        ampmElement.classList.add('hidden');
    }

    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    dateElement.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function toggleTimeFormat() {
    is24Hour = !is24Hour;
    updateTime();
}

function toggleTheme() {
    document.body.setAttribute('data-theme',
        document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    );
}

function updateTimezone() {
    currentTimezone = document.getElementById('timezone').value;
    updateTime();
}

// Mode switching
function switchMode(mode) {
    const tabs = document.querySelectorAll('.tab-btn');
    const modes = document.querySelectorAll('.clock-mode');
    
    // Update tabs
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if(tab.onclick.toString().includes(mode)) {
            tab.classList.add('active');
        }
    });

    // Smooth transition for modes
    modes.forEach(m => {
        m.style.opacity = '0';
        setTimeout(() => {
            m.style.display = 'none';
            if(m.id === `${mode}-mode`) {
                m.style.display = 'block';
                setTimeout(() => {
                    m.style.opacity = '1';
                }, 50);
            }
        }, 300);
    });
}

// Alarm functionality
let alarms = [];
function setAlarm() {
    const time = document.getElementById('alarm-time').value;
    alarms.push(time);
    updateAlarmsList();
}

function checkAlarms() {
    const now = new Date();
    const currentTime = `${now.getHours()}:${now.getMinutes()}`;
    alarms.forEach(alarm => {
        if (alarm === currentTime) {
            playAlarm();
        }
    });
}

function updateAlarmsList() {
    const alarmsElement = document.getElementById('active-alarms');
    alarmsElement.innerHTML = alarms.map((time, index) => `
        <div class="alarm-item">
            ${time}
            <button onclick="deleteAlarm(${index})">Delete</button>
        </div>
    `).join('');
}

function deleteAlarm(index) {
    alarms.splice(index, 1);
    updateAlarmsList();
}

function playAlarm() {
    const audio = document.getElementById('alarm-sound');
    audio.play();
}

// Timer functionality
let timerInterval;
let timerTime = 0;

function startTimer() {
    if (timerInterval) return;
    const minutes = document.getElementById('timer-minutes').value;
    timerTime = minutes * 60;
    updateTimerDisplay();
    timerInterval = setInterval(updateTimer, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerTime = 0;
    updateTimerDisplay();
}

function updateTimer() {
    if (timerTime <= 0) {
        clearInterval(timerInterval);
        playAlarm();
        return;
    }
    timerTime--;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerTime / 60);
    const seconds = timerTime % 60;
    document.getElementById('timer-display').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Stopwatch functionality
let stopwatchTime = 0;
let stopwatchInterval;
let laps = [];

function startStopwatch() {
    if (stopwatchInterval) return;
    stopwatchInterval = setInterval(() => {
        stopwatchTime++;
        updateStopwatchDisplay();
    }, 1000);
}

function pauseStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    stopwatchTime = 0;
    laps = [];
    updateStopwatchDisplay();
    updateLapTimes();
}

function addLap() {
    laps.push(stopwatchTime);
    updateLapTimes();
}

function updateStopwatchDisplay() {
    const hours = Math.floor(stopwatchTime / 3600);
    const minutes = Math.floor((stopwatchTime % 3600) / 60);
    const seconds = stopwatchTime % 60;
    document.getElementById('stopwatch-display').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateLapTimes() {
    const lapTimesElement = document.getElementById('lap-times');
    lapTimesElement.innerHTML = laps.map((time, index) => `
        <div class="lap-time">Lap ${index + 1}: ${formatTime(time)}</div>
    `).join('');
}

function formatTime(time) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Weather functionality
async function updateWeather() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=YourCity&appid=YOUR_API_KEY`);
        const data = await response.json();
        document.getElementById('weather-widget').innerHTML = 
            `${data.weather[0].main} ${Math.round(data.main.temp - 273.15)}°C`;
    } catch (error) {
        console.error('Weather update failed:', error);
    }
}

// Customization
function updateColors() {
    const color = document.getElementById('color-picker').value;
    document.documentElement.style.setProperty('--accent-color', color);
}

function updateFont() {
    const font = document.getElementById('font-selector').value;
    document.body.style.fontFamily = font;
}

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.toggle('active');
}

// Close settings when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('settings-modal');
    const settingsBtn = document.querySelector('.settings-btn');
    if (modal.classList.contains('active') && 
        !e.target.closest('.settings-content') && 
        !e.target.closest('.settings-btn')) {
        modal.classList.remove('active');
    }
});

// Prevent click propagation from settings content
document.querySelector('.settings-content').addEventListener('click', (e) => {
    e.stopPropagation();
});

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    updateWeather();
    setInterval(updateTime, 1000);
    setInterval(checkAlarms, 1000);
    setInterval(updateWeather, 1800000);
});
