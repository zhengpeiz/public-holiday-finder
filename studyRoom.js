let startButton, pauseButton, timerDisplay, alarmSound, backgroundMusic, endSessionButton;

const studyRoomState = new Proxy(
  {
    studyTime: 30 * 60,
    breakTime: 10 * 60,
    remainingTime: 0,
    isStudyTime: true,
    timerRunning: false,
    sessionActive: false, //a study session is active
    pauseButtonDisabled: true, 
    pauseOrResume: true, //the pause button is initially pause
  
    inputs: {
      studyTimeInput: 30,
      breakTimeInput: 10,
    },

    volumes: {
      alarm: 0.3, // 30%
      music: 0.3, // 30%
    },

    wallpaper : 'assets/images/background1.gif',
  },
  {

    set(target, property, value) {
      target[property] = value;

      if (property === 'pauseButtonDisabled') {
        updateButtonState('pauseTimer', value);
      }  else if(property === 'pauseOrResume'){
        updateButtonText('pauseTimer', value ? 'Pause' : 'Resume');
      } else if (property === 'sessionActive'){
        toggleSessionElements(value);
      } else if(property ==='isStudyTime'){
        toggleStudyPromt(value);
        //console.log(`isStudyTime has changed: ${value ? "Study Phase" : "Break Phase"}`);
      } else if (property === 'volumes') {
        // When volumes object is updated, apply changes to the audio elements
        if (value.alarm !== undefined) {
          alarmSound.volume = value.alarm; // Update alarm volume
        }
        if (value.music !== undefined) {
          backgroundMusic.volume = value.music; // Update music volume
        }
      }

      return true;
    }
  }
); 

const wallpaperStyles = {
  "assets/images/background1.gif": "lightgrey", // Text color for dark background
  "assets/images/background2.gif": "black",    // Text color for light background
  "assets/images/background3.gif": "white",    // Text color for medium-dark background
};

function updateButtonState(buttonId, disabled) {
  const button = document.getElementById(buttonId);
  if (button){
    button.disabled = disabled;
  }
}

function updateButtonText(buttonId, text) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.textContent = text;
  }
}

//When the study room is Loaded
export function loadStudyRoom() {
  if (!timerWorker) {
    timerWorker = new Worker("timerWorker.js");
    timerWorker.postMessage({ command: "preload" }); // A no-op message for readiness
  }
  
  const contentPlaceholder = document.getElementById("content-placeholder");
  contentPlaceholder.innerHTML = `
  <div class="study-room-container">
  <div class="study-room-background"></div>
  <div class="study-room-content">
    <h1>Virtual Study Room</h1>
    <div class="timer-controls">
      <label id="studyTimeText">Study Time (minutes):
        <input type="number" id="studyTimeInput" value="${studyRoomState.inputs.studyTimeInput}" min="1">
      </label>
      <label id="breakTimeText">Break Time (minutes):
        <input type="number" id="breakTimeInput" value="${studyRoomState.inputs.breakTimeInput}" min="1">
      </label>  
      <button id="startTimer">Start Timer</button>
      
      <h2 id="studyPrompt"></h2>
      <div id="timerDisplay"></div>
      <button id="pauseTimer" ${studyRoomState.pauseButtonDisabled ? 'disabled' : ''}>${studyRoomState.pauseOrResume ? 'Pause' : 'Resume'}</button>
      <button id="endSession">End Session</button>
    </div>
  </div>
</div>

    
    `; 

 

    const studyTimeInput = document.getElementById('studyTimeInput');
    const breakTimeInput = document.getElementById('breakTimeInput');

    enforceNumericIntegerInput(studyTimeInput);
    enforceNumericIntegerInput(breakTimeInput);


    startButton = document.getElementById('startTimer');
    pauseButton = document.getElementById('pauseTimer');
    timerDisplay = document.getElementById('timerDisplay');
    alarmSound = document.getElementById('alarmSound');
    backgroundMusic = document.getElementById('backgroundMusic');
    endSessionButton = document.getElementById('endSession');

    
    
    toggleSessionElements(studyRoomState.sessionActive);
    toggleStudyPromt(studyRoomState.isStudyTime);
    initializeAudioSettings();

    addTimerFunctionality();
    updateTimerDisplay(studyRoomState.remainingTime);

    //Wallpaper
    updateWallpaper(studyRoomState.wallpaper);
}

let timerInterval;
let timerWorker;

//This happends during the loading of study room 
function addTimerFunctionality() {
  
  //Start button click event
  startButton.addEventListener('click', () => {
    //console.log("Start button clicked.");
    studyRoomState.inputs.studyTimeInput = parseInt(document.getElementById('studyTimeInput').value);
    studyRoomState.inputs.breakTimeInput = parseInt(document.getElementById('breakTimeInput').value);

    studyRoomState.studyTime = studyRoomState.inputs.studyTimeInput * 60;
    studyRoomState.breakTime = studyRoomState.inputs.breakTimeInput * 60;
    
    if (!timerInterval) {
      
      studyRoomState.remainingTime = studyRoomState.isStudyTime  
      ? studyRoomState.studyTime 
      : studyRoomState.breakTime;
      studyRoomState.timerRunning = true;
      updateTimerDisplay(studyRoomState.remainingTime);
      backgroundMusic.play();

      //Play the fake alarm sound 
      //alarmSound.src = "assets/sounds/silence.mp3";
      alarmSound.play().then(() => {
        alarmSound.pause();       // Pause the audio immediately
        alarmSound.currentTime = 0; // Reset the playback position to the beginning
      }).catch((e) => {
        console.error("Error playing sound:", e);
      });
      
      

      console.log("Start button pushed.");
      startTimer();
      studyRoomState.pauseButtonDisabled = false;
    }

    studyRoomState.sessionActive = true;
  });

  //Pause/Resume button click event
  pauseButton.addEventListener('click', () => {
    if (pauseButton.textContent === 'Pause') {
      stopTimerWorker();
      pauseButton.textContent = 'Resume'; 
      studyRoomState.pauseOrResume = false;
      backgroundMusic.pause();
     
      studyRoomState.timerRunning = false;
    } else {
      pauseButton.textContent = 'Pause';
      studyRoomState.pauseOrResume = true;
      if(studyRoomState.isStudyTime)
      {   
        backgroundMusic.play();
       
      }
      startTimer();
      studyRoomState.timerRunning = true;
    }
  });

  //End button click event
  endSessionButton.addEventListener('click', () => {
    // clear the timer
    stopTimerWorker();

    // reset the session state;
    studyRoomState.sessionActive = false;
    studyRoomState.timerRunning = false;
    studyRoomState.remainingTime = 0;
    studyRoomState.pauseOrResume = true;
    studyRoomState.isStudyTime = true;
    
    //stop the sounds
    if (!alarmSound.paused) {
      alarmSound.pause();       // Stop the alarm immediately
      alarmSound.currentTime = 0; // Reset to the beginning
    } 

    if (!backgroundMusic.paused) {
      backgroundMusic.pause();       // Stop the music immediately
      backgroundMusic.currentTime = 0; // Reset to the beginning
    } 

    updateTimerDisplay(0);
  });
}
//Start/Continue the Timer based on the remaining time and the study&break time set by the user
function startTimer() {
  if (timerInterval) return; // Prevent duplicate intervals

  const startTime = Date.now();
  const endTime = startTime + studyRoomState.remainingTime * 1000;

  if (!timerWorker) {
    timerWorker = new Worker("timerWorker.js");

    timerWorker.onmessage = function (e) {
      if (e.data === "tick") {
        const currentTime = Date.now();
        const timeRemainingMs = endTime - currentTime;

        if (timeRemainingMs > 0) {
          studyRoomState.remainingTime = Math.ceil(timeRemainingMs / 1000);
          updateTimerDisplay(studyRoomState.remainingTime);
        } else {
          //alarmSound.pause();
          //Change it back
          alarmSound.src = "assets/sounds/alarm.mp3";
          
          alarmSound.play();

          studyRoomState.pauseButtonDisabled = true;
          // Timer ends
          stopTimerWorker();
          studyRoomState.remainingTime = 0;
          updateTimerDisplay(studyRoomState.remainingTime);

          // Play alarm sound
          //alarmSound.play();
          console.log("Alarm sound played");

          alarmSound.onended = () => {
            console.log("this is triggered");
            studyRoomState.isStudyTime = !studyRoomState.isStudyTime;
            studyRoomState.remainingTime = studyRoomState.isStudyTime
              ? studyRoomState.studyTime
              : studyRoomState.breakTime;

            // Handle background music
            if (studyRoomState.isStudyTime) {
              backgroundMusic.play();
            } else {
              backgroundMusic.pause();
            }

            startTimer(); // Restart the timer
            studyRoomState.pauseButtonDisabled = false;
          };
        }
      }
    };
  }

  // Start the Web Worker timer
  timerWorker.postMessage({ command: "start", intervalTime: 1000 });
}

//Stop the timer
function stopTimerWorker() {
  if (timerWorker) {
    timerWorker.postMessage({ command: "stop" });
    timerWorker.terminate();
    timerWorker = null;
  }
}


//Update the timer's display
function updateTimerDisplay(time){
  const minutes = Math.floor(time/60);
  const seconds = time % 60;
  const timerDisplay = document.getElementById('timerDisplay');
  if (timerDisplay) {
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

//Some elements should appear/disappear when the study session is active/inactive
function toggleSessionElements(sessionActive) {
  const inputFields = document.querySelectorAll('#studyTimeInput, #breakTimeInput, #studyTimeText, #breakTimeText');
  const startButton = document.getElementById('startTimer');
  const pauseButton = document.getElementById('pauseTimer');
  const timerDisplay = document.getElementById('timerDisplay');
  const endSessionButton = document.getElementById('endSession');
  const studyPrompt = document.getElementById('studyPrompt');
  
  if(sessionActive){
    //hide configuration elements
    inputFields.forEach(field => (field.style.display = 'none'));
    if(startButton) startButton.style.display = 'none';
    
    //show session elements
    if(pauseButton) pauseButton.style.display = 'inline-block';
    if(endSessionButton) endSessionButton.style.display='inline-block';
    if(timerDisplay) timerDisplay.style.display = 'block';
    if (studyPrompt) studyPrompt.style.display = 'block';

  } else {
    //show configuration elements
    inputFields.forEach(field => (field.style.display = 'inline-block'));
    if (startButton) startButton.style.display = 'inline-block';
    
    //hide session elements
    if (pauseButton) pauseButton.style.display = 'none';
    if (endSessionButton) endSessionButton.style.display = 'none';
    if (timerDisplay) timerDisplay.style.display = 'none';
    if (studyPrompt) studyPrompt.style.display = 'none';
    
  }
}
  //study prompt changes
  function toggleStudyPromt(isStudyTime) {
    const studyPrompt = document.getElementById('studyPrompt');
    if (isStudyTime){
      if (studyPrompt) studyPrompt.textContent = 
      `remaing time until break:`;
      //initializeAudioSettings();
    } else {
      if (studyPrompt) studyPrompt.textContent = 
      `remaing time until break ends:`; 
      //initializeAudioSettings();
    }
  }

  //Initialize volumes of music and alarm
  function initializeAudioSettings() {
    alarmSound.volume = studyRoomState.volumes.alarm; 
    backgroundMusic.volume = studyRoomState.volumes.music; 
  }
  //Change audio volumes
  function updateVolume(type, value) {
    if (type === 'alarm') {
      // Update the alarm volume 
      studyRoomState.volumes = {
        alarm: value,
        music: studyRoomState.volumes.music // Keep the current music volume
      };
    } else if (type === 'music') {
      // Update the music volume 
      studyRoomState.volumes = {
        alarm: studyRoomState.volumes.alarm, // Keep the current alarm volume
        music: value
      };
    }
  }
  
  //Suppress Safari from play audio when clicking back when it's not suppose to play
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      if (studyRoomState.remainingTime > 0 || alarmSound.paused) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
      }

      if (!studyRoomState.isStudyTime) {
        backgroundMusic.pause();
      }
      
      
    }
  }); 
  

  function updateWallpaper(newWallpaper) {
    studyRoomState.wallpaper = newWallpaper;
    const backgroundDiv = document.querySelector('.study-room-background');
    if (backgroundDiv) {
      backgroundDiv.style.backgroundImage = `url(${studyRoomState.wallpaper})`;
    }
    //Change text color
    const textElements = document.querySelectorAll(
      '.study-room-content h1, .study-room-content h2, .study-room-content label, #timerDisplay, #studyPrompt'
    );
  
    const textColor = wallpaperStyles[newWallpaper] || "black"; // Default to black if no style is found
    textElements.forEach((element) => {
      element.style.color = textColor;
    });
  }

  //forces the input box to only take intergers
  function enforceNumericIntegerInput(inputElement) {
    inputElement.addEventListener('keydown', (event) => {
      // Allow navigation keys and common control keys
      const allowedKeys = [
        'Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 
        'Enter', 'Escape'
      ];
      if (allowedKeys.includes(event.key)) return;
  
      // Allow only digits
      if (!/^[0-9]$/.test(event.key)) {
        event.preventDefault(); // Block invalid input
      }
    });
  
    inputElement.addEventListener('input', () => {
      // Remove any non-integer values that might have bypassed keydown
      inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
    });
  
    inputElement.addEventListener('blur', () => {
      // Ensure the value is at least the minimum value when leaving the field
      if (inputElement.value === '' || Number(inputElement.value) < inputElement.min) {
        inputElement.value = inputElement.min;
      }
    });
  }
  
  
  