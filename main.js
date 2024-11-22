document.addEventListener('DOMContentLoaded', () => {
  const menuIcon = document.getElementById('menu-icon');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  const studyRoomOption = document.getElementById('study-room-option');
  const holidayFinderOption = document.getElementById('holiday-finder-option');
  
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
    document.getElementById('content-placeholder').innerHTML = '<h2>Virtual Study Room</h2>';
  });

  holidayFinderOption.addEventListener('click', () => {
    setActiveOption(holidayFinderOption);
    document.getElementById('content-placeholder').innerHTML = `
    <h1>Public Holiday Finder</h1>
    <form id="holidayForm">
        <label for="country">Country:</label>
        <select id="country" name="country">
            <option value="AU">Australia</option>
            <option value="CN">China</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="IN">India</option>
        </select>

        <label for="year">Year:</label>
        <input type="number" id="year" name="year" value="2024" min="1900" max="2100">

        <button type="submit">Find Holidays</button>
    </form>

    <div id="holidayResults"></div>
    `; 

    //Add event listener to the holiday finder form
    const form = document.getElementById('holidayForm');
    form.addEventListener('submit', handleFormSubmit);
  }); 

  studyRoomOption.click();

});

function handleFormSubmit(event){
  event.preventDefault();

  const country = document.getElementById('country').value;
  const year = document.getElementById('year').value;

  fetchHolidays(country, year);
}

async function fetchHolidays(country, year){
  const apiKey = 'mhkpKExILr5ixNjNvS01FOq7p0na3Ecn'; // Replace with actual API key
  const url = `https://calendarific.com/api/v2/holidays?&api_key=${apiKey}&country=${country}&year=${year}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if(data.response.holidays && data.response.holidays.length > 0) {
      displayHolidays(data.response.holidays);
    } else {
      displayMessage('No holidays found for this country and year!');
    }
  } catch (error) {
    console.error('Error fetching holidays:', error);
    displayMessage('An error occurred while fetching the holidays.');
  }
}

function displayHolidays(holidays) {
  const resultsDiv = document.getElementById('holidayResults');
  resultsDiv.innerHTML = '';

  holidays.forEach(holiday => {
    const holidayDiv = document.createElement('div');
    holidayDiv.classList.add('holiday');

    holidayDiv.innerHTML = `
      <h3>${holiday.name}</h3>
      <p>Date: ${holiday.date.iso}</p>
      <p>Description: ${holiday.description || 'No description available.'}</p>
    `;

    resultsDiv.appendChild(holidayDiv);
  })
}

function displayMessage(message){
  const resultsDiv = document.getElementById('holidayResults');
  resultsDiv.innerHTML = `<p>${message}</p>`;
}