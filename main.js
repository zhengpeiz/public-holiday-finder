import { loadHolidayFinder } from './holidayFinder.js';
import { loadStudyRoom, destroyStudyRoom } from './studyRoom.js';

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

  //different pages
  const pages = {
    studyRoom: {
      load: loadStudyRoom,
      destroy: destroyStudyRoom,
    },
    holidayFinder: {
      load: loadHolidayFinder,
      destroy: destroyHolidayFinder ?? (() => {}),
    },
  };

  let currentPageKey = null;

  // Handle menu option clicks
  function switchPage(nextPageKey) {
    //Nothing happens when clicking the same page option
    if (currentPageKey === nextPageKey) return;

    // destroy current page → destroy
    if (currentPageKey && pages[currentPageKey]?.destroy) {
      pages[currentPageKey].destroy();
    }

    // load next page → load
    pages[nextPageKey].load();

    currentPageKey = nextPageKey;
  }

  // Load Virtual Study Room Content
  studyRoomOption.addEventListener('click', () => {
    switchPage('studyRoom');
    loadStudyRoom()
  });

  // Load Holiday Finder Content
  holidayFinderOption.addEventListener('click', () => {
    switchPage('holidayFinder');
  }); 

  studyRoomOption.click();

});


