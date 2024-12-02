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
        console.log(`isStudyTime has changed: ${value ? "Study Phase" : "Break Phase"}`);
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
  document.getElementById('content-placeholder').innerHTML = `
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

    

    
    `;

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

}

let timerInterval;

//This happends during the loading of study room 
function addTimerFunctionality() {
  
  //Start button click event
  startButton.addEventListener('click', () => {
    console.log("Start button clicked.");
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
      console.log("This gigi line.");
      startTimer();
      studyRoomState.pauseButtonDisabled = false;
    }

    studyRoomState.sessionActive = true;
  });

  //Pause/Resume button click event
  pauseButton.addEventListener('click', () => {
    if (pauseButton.textContent === 'Pause') {
      clearInterval(timerInterval);
      timerInterval = null;
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
    clearInterval(timerInterval);
    timerInterval = null;

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
  console.log(`this line is reached`); 
  console.log(`timerInterval is: ${timerInterval? "not null" : "null"}`);
  if (timerInterval) return; // Prevent duplicate intervals

  const startTime = Date.now(); // Record the start time
  console.log(`remaining time is now33: ${studyRoomState.remainingTime}`); 
  const endTime = startTime + studyRoomState.remainingTime * 1000; // Calculate the end time based on remaining time

  timerInterval = setInterval(() => {
    const currentTime = Date.now(); // Get the current time
    console.log(`remaining time is now1: ${studyRoomState.remainingTime}`); 
    const timeRemainingMs = endTime - currentTime; // Calculate remaining time in milliseconds
    
    if (timeRemainingMs > 0) {
      studyRoomState.remainingTime = Math.ceil(timeRemainingMs / 1000); // Convert ms to seconds
      console.log(`remaining time is now2: ${studyRoomState.remainingTime}`); 
      updateTimerDisplay(studyRoomState.remainingTime);
      
    } else {
      // Disable the pause button when timer ends
      studyRoomState.pauseButtonDisabled = true;

      clearInterval(timerInterval);
      console.log(`remaining time is now less than 0: ${studyRoomState.remainingTime}`);
      timerInterval = null; 
      console.log(`timerInterval set to null?: ${timerInterval? "not null" : "null"}`);

      studyRoomState.remainingTime = 0;
      updateTimerDisplay(studyRoomState.remainingTime);

      
      
      // Play alarm sound
      alarmSound.play();
      console.log(`Play Bitch`);
      // When alarm sound finishes, transition to next phase
      alarmSound.onended = () => {
        alarmSound.pause();
        console.log("alarmSound.onended triggered!");
      console.log(`alarmSound.paused: ${alarmSound.paused}`);
    console.log(`alarmSound.currentTime: ${alarmSound.currentTime}`);
    console.log(`alarmSound.ended: ${alarmSound.ended}`);
        console.trace();
        console.log(`isStudyTime before toggle: ${studyRoomState.isStudyTime}`);

        studyRoomState.isStudyTime = !studyRoomState.isStudyTime; // Toggle study/break phase
        console.log(`isStudyTime has changed: ${studyRoomState.isStudyTime ? "Study Phase" : "Break Phase"}`);
        console.log(`study time is: ${studyRoomState.studyTime}`);
        console.log(`break time is: ${studyRoomState.breakTime}`);
        
        studyRoomState.remainingTime = studyRoomState.isStudyTime
          ? studyRoomState.studyTime
          : studyRoomState.breakTime;

        console.log(`remaining time is now: ${studyRoomState.remainingTime}`);  
        // Handle background music based on phase
        if (studyRoomState.isStudyTime) {
          backgroundMusic.play();
        } else {
          backgroundMusic.pause();
        }

        console.log(`stateTimer() is reached`); 
        // Restart the timer
        startTimer();

        // Re-enable the pause button when the timer restarts
        studyRoomState.pauseButtonDisabled = false;
      };
    }
  }, 1000); // Check every second
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
      
      console.log("Tab became visible.");
      console.log(`alarmSound.paused: ${alarmSound.paused}`);
      console.log(`alarmSound.currentTime: ${alarmSound.currentTime}`);
      console.log(`alarmSound.ended: ${alarmSound.ended}`);
      console.log(`backgroundMusic.paused: ${backgroundMusic.paused}`);
      console.log(`backgroundMusic.currentTime: ${backgroundMusic.currentTime}`);
      console.log(`backgroundMusic.ended: ${backgroundMusic.ended}`); 
      console.log("Tab visible. Ensuring alarm sound does not play unintentionally.");
      
    }
  });