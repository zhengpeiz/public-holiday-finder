let startButton, pauseButton, timerDisplay, alarmSound, backgroundMusic;

const studyRoomState = new Proxy(
  {
    studyTime: 30 * 60,
    breakTime: 10 * 60,
    remainingTime: 0,
    isStudyTime: true,
    timerRunning: false,
    backgroundMusicPlaying: false,
    pauseButtonDisabled: true, 
    pauseOrResume: true, //the pause button is initially pause
    startButtonDisabled: false,
    inputs: {
      studyTimeInput: 30,
      breakTimeInput: 10,
    },
  },
  {

    set(target, property, value) {
      target[property] = value;

      if (property === 'pauseButtonDisabled') {
        updateButtonState('pauseTimer', value);
      } else if(property === 'startButtonDisabled'){
        updateButtonState('startTimer', value);
      } else if(property === 'pauseOrResume'){
        updateButtonText('pauseTimer', value ? 'Pause' : 'Resume');
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

export function loadStudyRoom() {
  document.getElementById('content-placeholder').innerHTML = `
    <h1>Virtual Study Room</h1>
    <div class="timer-controls">
      <label>Study Time (minutes):
        <input type="number" id="studyTimeInput" value="${studyRoomState.inputs.studyTimeInput}" min="1">
      </label>
      <label>Break Time (minutes):
        <input type="number" id="breakTimeInput" value="${studyRoomState.inputs.breakTimeInput}" min="1">
      </label>  
      <button id="startTimer" ${studyRoomState.startButtonDisabled ? 'disabled' : ''}>Start Timer</button>
      <button id="pauseTimer" ${studyRoomState.pauseButtonDisabled ? 'disabled' : ''}>${studyRoomState.pauseOrResume ? 'Pause' : 'Resume'}</button>
    </div>

    <div id="timerDisplay">${formatTime(studyRoomState.remainingTime)}</div>

    
    `;

    startButton = document.getElementById('startTimer');
    pauseButton = document.getElementById('pauseTimer');
    timerDisplay = document.getElementById('timerDisplay');
    alarmSound = document.getElementById('alarmSound');
    backgroundMusic = document.getElementById('backgroundMusic');

    if (studyRoomState.timerRunning){
      startTimer();
    }
    
    addTimerFunctionality();

}

let timerInterval;




function addTimerFunctionality() {
  
  startButton.addEventListener('click', () => {
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
      studyRoomState.backgroundMusicPlaying = true;
      startTimer();
      studyRoomState.startButtonDisabled = true;
      studyRoomState.pauseButtonDisabled = false;
    }
  });

  /*startButton.addEventListener('click', () => {
    console.log('Start button clicked');
    backgroundMusic.play().catch(err => console.error('Error playing background music:', err));
  });*/
  
  pauseButton.addEventListener('click', () => {
    if (pauseButton.textContent === 'Pause') {
      clearInterval(timerInterval);
      timerInterval = null;
      pauseButton.textContent = 'Resume'; 
      studyRoomState.pauseOrResume = false;
      backgroundMusic.pause();
      studyRoomState.backgroundMusicPlaying = false;
      studyRoomState.timerRunning = false;
    } else {
      pauseButton.textContent = 'Pause';
      studyRoomState.pauseOrResume = true;
      if(studyRoomState.isStudyTime)
      {   
        backgroundMusic.play();
        studyRoomState.backgroundMusicPlaying = true;
      }
      startTimer();
      studyRoomState.timerRunning = true;
    }
  });
}

function startTimer(){
  if(timerInterval) return; //Prevent duplicate
  
  timerInterval = setInterval(() => {
    if (studyRoomState.remainingTime > 0) {
      studyRoomState.remainingTime--;
      updateTimerDisplay(studyRoomState.remainingTime);
    } else {
      //disable the pause button 
     studyRoomState.pauseButtonDisabled = true;

      clearInterval(timerInterval);
      timerInterval = null;
      studyRoomState.remainingTime = 0;
      updateTimerDisplay(studyRoomState.remainingTime); 

      
      
      alarmSound.play(); 
      

      
      alarmSound.onended = () => {
        studyRoomState.isStudyTime = !studyRoomState.isStudyTime;
        studyRoomState.remainingTime = studyRoomState.isStudyTime 
        ? studyRoomState.studyTime 
        : studyRoomState.breakTime;

        //play the music if entering study phase
        if(studyRoomState.isStudyTime) {
          backgroundMusic.play();
        } else {
          backgroundMusic.pause();
        }

        // Restart the timer
        startTimer();
        //enable the button 
        studyRoomState.pauseButtonDisabled = false;
      }

      
    }
  }, 1000);
}

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