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
    addTimerFunctionality();

}

let timerInterval;
let isStudyTime = true;
let remainingTime = 0;

function addTimerFunctionality() {
  const startButton = document.getElementById('startTimer');
  const pauseButton = document.getElementById('pauseTimer');
  const timerDisplay = document.getElementById('timerDisplay');
  const alarmSound = document.getElementById('alarmSound');
  const backgroundMusic = document.getElementById('backgroundMusic');

  startButton.addEventListener('click', () => {
    const studyTime = parseInt(document.getElementById('studyTimeInput').value) * 60;
    const breakTime = parseInt(document.getElementById('breakTimeInput').value) * 60;

    if (!timerInterval) {
      remainingTime = isStudyTime ? studyTime : breakTime;
      updateTimerDisplay(remainingTime);
      backgroundMusic.play();
      startTimer(studyTime, breakTime, timerDisplay, alarmSound, backgroundMusic);
      startButton.disabled = true;
      pauseButton.disabled = false;
    }
  });

  startButton.addEventListener('click', () => {
    console.log('Start button clicked');
    backgroundMusic.play().catch(err => console.error('Error playing background music:', err));
  });
  
  pauseButton.addEventListener('click',() => {
    clearInterval(timerInterval);
    timerInterval = null;
    startButton.disabled = false;
    pauseButton.disabled = true;
    backgroundMusic.pause();
  });
}

function startTimer(studyTime, breakTime, timerDisplay, alarmSound, backgroundMusic){
  timerInterval = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime--;
      updateTimerDisplay(remainingTime);
    } else {
      
      clearInterval(timerInterval);
      timerInterval = null;
      updateTimerDisplay(0);
      alarmSound.play();

      //when the alarm sound finishes,continue the timer
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