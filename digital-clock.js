let is24Hour = false;

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
    const timeInput = document.getElementById('alarm-time');
    if (!timeInput.value) {
        alert('Please select a time for the alarm');
        return;
    }
    
    const [hours, minutes] = timeInput.value.split(':');
    const alarmTime = `${hours}:${minutes}`;
    
    if (!alarms.includes(alarmTime)) {
        alarms.push(alarmTime);
        updateAlarmsList();
        timeInput.value = '';
    } else {
        alert('This alarm already exists!');
    }
}

function checkAlarms() {
    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    alarms.forEach(alarm => {
        if (alarm === currentTime) {
            startAlarmSound();
        }
    });
}

function updateAlarmsList() {
    const alarmsElement = document.getElementById('active-alarms');
    alarmsElement.innerHTML = alarms.map((time, index) => `
        <div class="alarm-item">
            <span>${time}</span>
            <button class="delete-alarm" onclick="deleteAlarm(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function deleteAlarm(index) {
    alarms.splice(index, 1);
    updateAlarmsList();
}

function playAlarm() {
    const audio = document.getElementById('alarm-sound');
    const volume = document.getElementById('alarm-volume').value;
    audio.volume = volume;
    audio.loop = true;
    audio.currentTime = 0;
    audio.play().catch(error => {
        console.error('Error playing alarm:', error);
        alert('Could not play alarm sound. Please check your browser settings.');
    });
    
    // Stop alarm after 30 seconds
    setTimeout(() => {
        audio.pause();
        audio.loop = false;
        audio.currentTime = 0;
    }, 30000);
}

function testAlarm() {
    const audio = document.getElementById('alarm-sound');
    const volume = document.getElementById('alarm-volume').value;
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().then(() => {
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
        }, 2000); // Play for 2 seconds as test
    }).catch(error => {
        console.error('Error testing alarm:', error);
        alert('Could not play alarm sound. Please check your browser settings.');
    });
}

function testAlarmSound() {
    const audio = document.getElementById('alarm-sound');
    const volume = document.getElementById('alarm-volume').value;
    audio.volume = volume;
    audio.currentTime = 0;
    audio.loop = false;
    
    // Play for 2 seconds only
    audio.play().then(() => {
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
        }, 2000);
    }).catch(error => {
        console.error('Error playing test sound:', error);
        alert('Could not play alarm sound. Please check your browser settings.');
    });
}

function startAlarmSound() {
    const audio = document.getElementById('alarm-sound');
    const volume = document.getElementById('alarm-volume').value;
    const popup = document.getElementById('alarm-popup');
    
    audio.volume = volume;
    audio.currentTime = 0;
    audio.loop = true;
    
    audio.play().then(() => {
        popup.style.display = 'flex';
    }).catch(error => {
        console.error('Error playing alarm:', error);
        alert('Could not play alarm sound. Please check your browser settings.');
    });
}

function stopAlarm() {
    const audio = document.getElementById('alarm-sound');
    const popup = document.getElementById('alarm-popup');
    
    // Stop the audio
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
    
    // Hide the popup
    popup.style.display = 'none';
    
    // Find and remove the current alarm time from alarms array
    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;
    
    const index = alarms.indexOf(currentTime);
    if (index > -1) {
        alarms.splice(index, 1);
        updateAlarmsList();
    }
}

function snoozeAlarm() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const snoozeTime = `${hours}:${minutes}`;
    
    if (!alarms.includes(snoozeTime)) {
        alarms.push(snoozeTime);
        updateAlarmsList();
    }
    
    stopAlarm();
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
