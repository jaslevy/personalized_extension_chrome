// Declaring myList Globally
let myList = [];

// Declare listElement in the global scope
let listElement;

// Functions to be called

function saveListToStorage() {
    chrome.storage.local.set({ myList: myList });
}

// Function to update weather at midnight
function updateWeatherAtMidnight() {
    // Calculate the time until midnight (in milliseconds)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight - now;

    // Set an interval to update the weather data at midnight
    setInterval(function() {
        loadApiKey(); // Load API key and call getWeather
    }, timeUntilMidnight);
}

// Load the API key from config.json
function loadApiKey() {
    fetch(chrome.runtime.getURL('config.json'))
        .then(response => response.json())
        .then(config => {
            const openWeatherApiKey = config.openWeather;
            getWeather(openWeatherApiKey); // After loading the API key, call getWeather
        });
}

// Function to get weather data
function getWeather(apiKey) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;

            // Make the API request to get weather data
            $.ajax({
                url: `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`,
                method: 'GET',
                success: function (response) {
                    var temperature = response.main.temp;
                    var description = response.weather[0].description;

                    // Update your HTML elements with the weather data
                    $('#temperature').text(temperature);
                    $('#description').text(description);
                }
            });
        });
    }
}

// Populating todo list
// Function to populate the list in the HTML
// Function to create a list item
function createListItem(item) {
    const listItem = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked;
    listItem.appendChild(checkbox);

    const itemText = document.createElement('span');
    itemText.textContent = item.text;
    itemText.contentEditable = true;
    listItem.appendChild(itemText);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    listItem.appendChild(deleteButton);

    return listItem;
}

// Function to add an item to the list
function addItemToList(newItem) {
    const listItem = createListItem(newItem);
    listElement.appendChild(listItem);

    const itemText = listItem.querySelector('span');
    const deleteButton = listItem.querySelector('button');
    const checkbox = listItem.querySelector('input');

    // Event listener for saving edited text
    itemText.addEventListener('input', function (event) {
        const editedText = event.target.textContent;
        newItem.text = editedText;
        saveListToStorage();
    });

    // Event listener to delete the item
    deleteButton.addEventListener('click', function () {
        const itemIndex = myList.indexOf(newItem);
        if (itemIndex !== -1) {
            myList.splice(itemIndex, 1);
            listElement.removeChild(listItem);
            saveListToStorage();
        }
    });

    // Event listener for checkbox state
    checkbox.addEventListener('change', function () {
        newItem.checked = checkbox.checked;
        saveListToStorage();
    });
}

// Main list rendering function
function populateList() {
    listElement.innerHTML = ''; // Clear the list before rendering
    myList.forEach((item) => {
        const listItem = createListItem(item);
        listElement.appendChild(listItem);
        addItemToList(item);
    });
}

// Additional code for adding items
const newItemInput = document.getElementById('newItem');
listElement = document.getElementById('myList'); // Define listElement here

newItemInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        const newItemText = newItemInput.value.trim();
        if (newItemText !== '') {
            const newItem = {
                text: newItemText,
                checked: false
            };

            myList.push(newItem);

            const listItem = createListItem(newItem);
            listElement.appendChild(listItem);

            newItemInput.value = '';
            saveListToStorage();
        }
    }
});

// When popup is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Retrieve data from local storage
    chrome.storage.local.get(['myList'], function (result) {
        if (!chrome.runtime.lastError) {
            myList = result.myList || [];
            console.log('Retrieved data:', myList);
            // Now you can use the data in your extension
            populateList();
        }
    });

    // Call the updateWeatherAtMidnight function to set up the interval
    updateWeatherAtMidnight();
});
