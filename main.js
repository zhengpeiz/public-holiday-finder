import { loadHolidayFinder } from './holidayFinder.js';
import { loadStudyRoom } from './studyRoom.js';

document.addEventListener('DOMContentLoaded', () => {
  const menuIcon = document.getElementById('menu-icon');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  const studyRoomOption = document.getElementById('study-room-option');
  const holidayFinderOption = document.getElementById('holiday-finder-option');
  ////////
  /*
  const originalPlay = alarmSound.play.bind(alarmSound);

  alarmSound.play = function () {
  console.log("alarmSound.play() triggered!");
  console.trace(); // Log the stack trace to identify the call location
  return originalPlay();
  /////////
};*/
  // Toggle sidebar visibility
  menuIcon.addEventListener('click', () => {
    const sidebarLeft = window.getComputedStyle(sidebar).left;
    if (sidebar.style.left === '0px') {
      sidebar.style.left = '-250px';
      mainContent.style.marginLeft = '0px';
    } else {
      sidebar.style.left = '0px';
      mainContent.style.marginLeft = '250px';
    }
  });

  // Handle menu option clicks
  function setActiveOption(option) {
    studyRoomOption.classList.remove('active');
    holidayFinderOption.classList.remove('active');
    option.classList.add('active');
  }

  // Load Virtual Study Room Content
  studyRoomOption.addEventListener('click', () => {
    setActiveOption(studyRoomOption);
    //loadStudyRoom();
  });

  // Load Holiday Finder Content
  holidayFinderOption.addEventListener('click', () => {
    setActiveOption(holidayFinderOption);
    loadHolidayFinder();
  }); 

  studyRoomOption.click();

});


