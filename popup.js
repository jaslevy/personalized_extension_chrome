// Functions to be called
// Load the Google API Client Library with your API key and client ID
// Function to update weather at midnight
function updateWeatherAtMidnight() {
    // Calculate the time until midnight (in milliseconds)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight - now;

    // Set an interval to update the weather data at midnight
    setInterval(function() {
        getWeather();
    }, timeUntilMidnight);
}

gapi.load('client:auth2', function() {
    gapi.client.init({
        apiKey: 'YOUR_API_KEY',
        clientId: 'YOUR_CLIENT_ID',
        discoveryDocs: ['https://people.googleapis.com/$discovery/rest'],
    }).then(function() {
        // Authorize the user
        gapi.auth2.getAuthInstance().signIn().then(function() {
            // Fetch the user's profile data
            gapi.client.people.people.get({
                resourceName: 'people/me',
                personFields: 'names',
            }).then(function(response) {
                var userName = response.result.names[0].displayName;
                // Update the <h1> tag with the user's name
                document.querySelector('h1').textContent = 'Hello, ' + userName;
            });
        });
    });
});

// Getting API key
fetch(chrome.runtime.getURL('config.json'))
  .then(response => response.json())
  .then(config => {
    const openWeatherApiKey = config.openWeather;
  });

// Function to get the user's location and fetch weather data
function getWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            var apiKey = 'YOUR_OPENWEATHER_API_KEY';

            // Make the API request to get weather data
            $.ajax({
                url: `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}`,
                method: 'GET',
                success: function(response) {
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
function populateList() {
    myList.forEach((item, index) => {
        // Create a list item element
        const listItem = document.createElement('li');

        // Create a checkbox for the item
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.checked;
        listItem.appendChild(checkbox);

        // Create a span for the item text
        const itemText = document.createElement('span');
        itemText.textContent = item.text;
        // Enable text editing by setting 'contenteditable' attribute to true
        itemText.contentEditable = true;
        listItem.appendChild(itemText);

        // Create a "Delete" button for each item
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        listItem.appendChild(deleteButton);

        // Add the item to the list
        listElement.appendChild(listItem);

        // Event listener for saving edited text
        itemText.addEventListener('blur', function() {
            item.text = itemText.textContent;
            // Save the updated list to storage
            chrome.storage.local.set({ myList: myList });
        });

        // Event listener to delete the item
        deleteButton.addEventListener('click', function() {
            myList.splice(index, 1);
            // Update the HTML list and save the updated list to storage
            listElement.removeChild(listItem);
            chrome.storage.local.set({ myList: myList });
        });

        // Event listener for checkbox state
        checkbox.addEventListener('change', function() {
            item.checked = checkbox.checked;
            // Save the updated list to storage
            chrome.storage.local.set({ myList: myList });
        });
    });

    // Additional code for adding items
    const addItemButton = document.getElementById('addItemButton');
    const newItemInput = document.getElementById('newItem');

    addItemButton.addEventListener('click', function() {
        const newItemText = newItemInput.value.trim();
        if (newItemText !== '') {
            // Create a new item object with text and initial checkbox state
            const newItem = {
                text: newItemText,
                checked: false // Initial state is unchecked
            };

            myList.push(newItem);

            // Update the HTML list with the checkbox
            const listItem = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            listItem.appendChild(checkbox);

            // Create a span for the item text
            const itemText = document.createElement('span');
            itemText.textContent = newItem.text;
            itemText.contentEditable = true;
            listItem.appendChild(itemText);

            // Create a "Delete" button for each item
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            listItem.appendChild(deleteButton);

            // Add the item to the list
            listElement.appendChild(listItem);

            // Event listener for saving edited text
            itemText.addEventListener('blur', function() {
                newItem.text = itemText.textContent;
                // Save the updated list to storage
                chrome.storage.local.set({ myList: myList });
            });

            // Event listener to delete the item
            deleteButton.addEventListener('click', function() {
                const itemIndex = myList.indexOf(newItem);
                if (itemIndex !== -1) {
                    myList.splice(itemIndex, 1);
                    // Update the HTML list and save the updated list to storage
                    listElement.removeChild(listItem);
                    chrome.storage.local.set({ myList: myList });
                }
            });

            // Clear the input field
            newItemInput.value = '';

            // Save the updated list to storage
            chrome.storage.local.set({ myList: myList });
        }
    });

    newItemInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            addItemButton.click();
        }
    });
}


// When popup is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Retrieve data from local storage
    chrome.storage.local.get(['myData'], function(result) {
        if (!chrome.runtime.lastError) {
            const myList = result.myData || [];
            console.log('Retrieved data:', myList);
            // Now you can use the data in your extension
            populateList();
        }
    });
    // Getting data from manifest
    const manifest = chrome.runtime.getManifest();
    const openWeatherApiKey = manifest.apiKeys.openWeather;
    // Calling the getWeather function to fetch weather data
    getWeather();
    // Call the updateWeatherAtMidnight function to set up the interval
    updateWeatherAtMidnight();

    

    
});

    // Getting data from manifest
    const manifest = chrome.runtime.getManifest();
    const openWeatherApiKey = manifest.apiKeys.openWeather;


    // Load the Google API Client Library with your API key and client ID
    gapi.load('client:auth2', function() {
        gapi.client.init({
            apiKey: 'YOUR_API_KEY',
            clientId: 'YOUR_CLIENT_ID',
            discoveryDocs: ['https://people.googleapis.com/$discovery/rest'],
        }).then(function() {
            // Authorize the user
            gapi.auth2.getAuthInstance().signIn().then(function() {
                // Fetch the user's profile data
                gapi.client.people.people.get({
                    resourceName: 'people/me',
                    personFields: 'names',
                }).then(function(response) {
                    var userName = response.result.names[0].displayName;
                    // Update the <h1> tag with the user's name
                    document.querySelector('h1').textContent = 'Hello, ' + userName;
                });
            });
        });
    });

    // Function to get the user's location and fetch weather data
    function getWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;
                var apiKey = 'YOUR_OPENWEATHER_API_KEY';

                // Make the API request to get weather data
                $.ajax({
                    url: `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}`,
                    method: 'GET',
                    success: function(response) {
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



