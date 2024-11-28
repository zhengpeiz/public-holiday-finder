let startButton, pauseButton, timerDisplay, alarmSound, backgroundMusic;
export function loadStudyRoom() {
  document.getElementById('content-placeholder').innerHTML = `
    <h1>Virtual Study Room</h1>
    <div class="timer-controls">
      <label>Study Time (minutes):
        <input type="number" id="studyTimeInput" value="30" min="1">
      </label>
      <label>Break Time (minutes):
        <input type="number" id="breakTimeInput" value="10" min="1">
      </label>  
      <button id="startTimer">Start Timer</button>
      <button id="pauseTimer" disabled>Pause</button>
    </div>

    <div id="timerDisplay">00:00</div>

    <!-- Audio Elements for Alarm and Background Music -->
    <audio id="alarmSound" src="assets/sounds/alarm.mp3" preload="auto"></audio>
    <audio id="backgroundMusic" src="assets/sounds/study-music.mp3" loop preload="auto"></audio>
    `;

    startButton = document.getElementById('startTimer');
    pauseButton = document.getElementById('pauseTimer');
    timerDisplay = document.getElementById('timerDisplay');
    alarmSound = document.getElementById('alarmSound');
    backgroundMusic = document.getElementById('backgroundMusic');

    addTimerFunctionality();

}

let timerInterval;
let isStudyTime = true;
let remainingTime = 0;
let studyTime = 0;
let breakTime = 0;



function addTimerFunctionality() {
  
  startButton.addEventListener('click', () => {
    studyTime = parseInt(document.getElementById('studyTimeInput').value) * 60;
    breakTime = parseInt(document.getElementById('breakTimeInput').value) * 60;

    if (!timerInterval) {
      remainingTime = isStudyTime ? studyTime : breakTime;
      updateTimerDisplay(remainingTime);
      backgroundMusic.play();
      startTimer(studyTime, breakTime, timerDisplay, alarmSound, backgroundMusic);
      startButton.disabled = true;
      pauseButton.disabled = false;
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
      backgroundMusic.pause();
    } else {
      pauseButton.textContent = 'Pause';
      if(isStudyTime)
      {   
        backgroundMusic.play();
      }
      startTimer(studyTime, breakTime, timerDisplay, alarmSound, backgroundMusic);
    }
  });
}

function startTimer(studyTime, breakTime, timerDisplay, alarmSound, backgroundMusic){
  timerInterval = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime--;
      updateTimerDisplay(remainingTime);
    } else {
      //disable the pause button when the alarm is played
     pauseButton.disabled = true;

      clearInterval(timerInterval);
      timerInterval = null;
      updateTimerDisplay(0); 

      
      
      alarmSound.play(); 
      

      
      alarmSound.onended = () => {
        isStudyTime = !isStudyTime;
        remainingTime = isStudyTime ? studyTime : breakTime;

        //play the music if entering study phase
        if(isStudyTime) {
          backgroundMusic.play();
        } else {
          backgroundMusic.pause();
        }

        // Restart the timer
        startTimer(studyTime, breakTime, timerDisplay, alarmSound, backgroundMusic);
        //enable the button when the timer starts again
        pauseButton.disabled = false;
      }

      
    }
  }, 1000);
}

function updateTimerDisplay(time){
  const minutes = Math.floor(time/60);
  const seconds = time % 60;
  const timerDisplay = document.getElementById('timerDisplay');
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}