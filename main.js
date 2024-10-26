document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('holidayForm');
  form.addEventListener('submit', handleFormSubmit);
});

function handleFormSubmit(event){
  event.preventDefault();

  const country = document.getElementById('country').value;
  const year = document.getElementById('year').value;

  fetchHolidays(country, year);
}

async function fetchHolidays(country, year){
  const apiKey = 'mhkpKExILr5ixNjNvS01FOq7p0na3Ecn'; // Replace with actual API key
  const url = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${country}&year=${year}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if(data.response.holidays && data.response.hoildays.length > 0) {
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