/* 
 * Project: Pit Stop Central
 * File Name: script.js
 * Course: 3612 - Web Development for Computer Sciencists
 * Instructor: Randy Connolly
 * Contributors: Diego Gonzalez Reyes
 * Purpose: 
 *  - This script provides functionality for managing and displaying favorite racing data, 
 *    including drivers, constructors, and circuits. It also handles API calls, dynamic 
 *    data rendering, and user interactions via popups and tables.
 * Details:
 *  - Features include sorting, displaying data from API or cache, toggling favorites, 
 *    and handling dynamic UI updates. The script ensures efficient interaction with 
 *    localStorage and supports a user-friendly interface.
 * Assumptions:
 *  - The DOM contains the required elements with specific IDs and classes for event handling.
 *  - API endpoints are accessible and return valid data.
 * Libraries:
 *  - None (vanilla JavaScript).
 * 
 * Sources:
 *  - https://www.w3schools.com/graphics/svg_path.asp
 *  - https://www.chatgpt.com/
 *  - https://tailwindui.com/documentation
 *  - https://www.i2symbol.com/symbols/arrows
 *  - https://fsymbols.com/heart/
 *  - https://www.w3schools.com/jsref/jsref_push.asp
 *  - https://www.w3schools.com/jsref/jsref_splice.asp
 *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
 *  - https://stackoverflow.com/questions/7760262/replace-both-double-and-single-quotes-in-javascript-string
 *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
 *  - https://www.w3schools.com/jsref/jsref_filter.asp
 *  - https://www.w3schools.com/jsref/jsref_split.asp
 *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
 *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
 *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
 *  - https://api.daypilot.org/daypilot-row-children/
 *  - https://www.w3schools.com/jsref/jsref_sort.asp
 *  - https://www.w3schools.com/jsref/jsref_from.asp
 *  - https://www.w3schools.com/jsref/met_win_settimeout.asp
 *  - https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
 *  - https://www.w3schools.com/howto/howto_js_sort_table.asp
 *  - https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
 *  - https://blog.logrocket.com/storing-retrieving-javascript-objects-localstorage 
 *  - https://sentry.io/answers/truthy-and-falsy-values-in-javascript/#:~:text=When%20non%2Dboolean%20values%20are,into%20false%20are%20called%20falsy. 
 *
 * ChatGPT:
 *   - help me with the syntax for tailwind, when I was not sure about it.
 *   - Understanding certain concepts and functions in JavaScript, like optional chaining, or ternary operators.
 *   - Debugging the code, by helping me understand why certain parts of the code were not working as expected.
 *   - Helping me to correct the syntax of the code, when I was not sure about it.
 */

// Initialize favorites from localStorage or default to empty arrays
const favorites = JSON.parse(localStorage.getItem('favorites')) || 
{
    drivers: [],
    constructors: [],
    circuits: []
};

console.log('initial favorites', favorites);

/*
 * Name: DOMContentLoaded Event Handler
 * Purpose: Initializes the application's UI and functionality once the DOM is fully loaded.
 * Details:
 *  - Sets up event listeners for user interactions (e.g., button clicks, table sorting).
 *  - Manages dynamic content updates such as race data, sorting tables, and toggling views.
 *  - Handles data fetching and display logic for various sections of the UI.
 *  - Provides utility functions to sort tables and retrieve cell data for sorting.
 * Libraries: None
 * Assumptions:
 *  - All required DOM elements are available and correctly identified by their IDs or classes.
 *  - The application relies on external functions like `processData`, `displayData`, and `showFavoritesPopup`.
 */
document.addEventListener('DOMContentLoaded', () => {
    //localStorage.clear(); // Uncomment to clear all stored data

    // Get references to all needed DOM elements
    const favoritesButton = document.getElementById('favorites-button');
    const submitButton = document.getElementById('submit-season');
    const raceView = document.getElementById('race-view');
    
    // Add event listeners for favorite buttonsc
    favoritesButton.addEventListener('click', (e) => {
        e.preventDefault();
        showFavoritesPopup();
    });

    /*
    * Name: Table Header Sorting Event Handler
    * Purpose: Enables sorting functionality for table columns by clicking on the headers.
    * Details:
    *  - Attaches click event listeners to table headers with `data-column` attributes.
    *  - Retrieves column, order, and table information from the header's dataset and DOM hierarchy.
    *  - Calls `sortTable` to reorder rows based on the specified column and order.
    *  - Updates visual indicators (e.g., `sorted-asc`, `sorted-desc` classes) for sorting direction.
    *  - Toggles the sort order for subsequent clicks and removes indicators after 2 seconds.
    * Assumptions:
    *  - Each table header has a valid `data-column` and `data-order` attribute.
    *  - The table contains a `<tbody>` with an `id` to identify rows for sorting.
    */
    document.querySelectorAll('th[data-column]').forEach(theader => {
        theader.addEventListener('click', () => {
            const column = theader.dataset.column;
            const order = theader.dataset.order;
            const tableId = theader.closest('table').querySelector('tbody').id;

            sortTable(column, order, tableId);

            // Toggle the sorting classes
            theader.classList.add(order === 'asc' ? 'sorted-asc' : 'sorted-desc');
            theader.classList.remove(order === 'asc' ? 'sorted-desc' : 'sorted-asc');

            // Update the order for the next click
            theader.dataset.order = order === 'asc' ? 'desc' : 'asc';

            // Remove the sorting indicator after 1 seconds
            setTimeout(() => {
                theader.classList.remove('sorted-asc', 'sorted-desc');
            }, 1000);

        });
    });

   /* 
    * Name: sortTable
    * Parameters: 
    *  - column (string): The column name to sort by.
    *  - order (string): The sort order, either 'asc' (ascending) or 'desc' (descending).
    *  - tableId (string): The ID of the table's `<tbody>` element.
    * Return Value: None
    * Details: 
    *  - Sorts a table's rows based on the specified column and order.
    *  - Updates the DOM by reordering rows in the table body.
    */
    function sortTable(column, order, tableId) 
    {
        const tableBody = document.getElementById(tableId);
        const rows = Array.from(tableBody.querySelectorAll('tr'));

        rows.sort((a, b) => {
            const aData = getCellData(a, column);
            const bData = getCellData(b, column);

            if (order === 'asc')
            {
                return aData > bData ? 1 : -1;
            }
            else 
            {  
                return aData < bData ? 1 : -1;
            }
        });

        tableBody.innerHTML = '';
        rows.forEach(row => tableBody.appendChild(row));
    }

   /* 
    * Name: getCellData
    * Parameters: 
    *  - row (HTMLElement): A row element from the table.
    *  - column (string): The column name to extract data from.
    * Return Value: 
    *  - (string | number): The content of the specified cell, converted to a number if applicable.
    * Details: 
    *  - Maps column names to cell indices.
    *  - Retrieves and processes the cell value for sorting purposes.
    */
    function getCellData(row, column)
    {
        const columnMap = {
            position: 0,
            driver: 1,
            constructor: 2,
            laps: 3,
            points: 4,
            q1: 3,
            q2: 4,
            q3: 5
        };

        const cellIndex = columnMap[column];
        const cellValue = row.children[cellIndex]?.innerText.trim();

        if (['position', 'laps', 'points', 'q1', 'q2', 'q3'].includes(column))
        {
            return parseFloat(cellValue) || 0;
        }

        return cellValue || '';
    }

    // Handle season submission
    submitButton.addEventListener('click', async () => {

        const loader = document.getElementById('loader');
        loader.classList.remove('hidden'); // show load animation
        
        try 
        {
            const seasonYear = document.getElementById('season-year');
            const selectedSeason = document.getElementById('season').value;
            // Only proceed if a valid season is selected
            if (selectedSeason && selectedSeason !== "Select Season")
            {
                // Update the heading with selected season
                seasonYear.textContent = selectedSeason + " Races";
                // Fetch and display race data
                const raceData = await processData(selectedSeason, 'race');
                displayData(raceData, 'race-content');
                // Show the race view
                raceView.classList.remove('hidden');
                raceView.style.display = "flex";
            }
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            loader.classList.add('hidden'); // hide load animation
        }
    });
    // Toggle menu
    document.getElementById('menu-icon').addEventListener('click', () => {
        const menuItems = document.getElementById('menu-items');
        menuItems.classList.toggle('hidden');
    });
    // Return to home view
    document.getElementById('home-button').addEventListener('click', () => {
        const resultsView = document.getElementById('results-view');
        const popup = document.getElementById('popup-template');

        // Hide both race and results views
        raceView.classList.add('hidden');
        raceView.style.display = "none";
        resultsView.classList.add('hidden');
        resultsView.style.display = "none";
        // Re-enable background interaction
        document.getElementById('main-section').classList.remove('disable-interaction');
        popup.classList.add('hidden');

        hideResultsView();
    });
});

/* 
 * Name: processData
 * Parameters: 
 *  - season (string): The selected season year.
 *  - id (string): The type of data to fetch (e.g., "race", "results", "qualifying").
 * Return Value: 
 *  - Object: An object containing the requested data (race, results, or qualifying).
 * Details: 
 *  - Fetches data from the API or retrieves it from localStorage if cached.
 *  - Returns the relevant data for the specified season and type.
*/
async function processData(season, id) 
{
    // Define the base domain for the API
    const domain = 'https://www.randyconnolly.com/funwebdev/3rd/api/f1'; 

    // Define the API endpoints and storage keys
    const apis = { 
        race: `${domain}/races.php?season=${season}`,
        results: `${domain}/results.php?season=${season}`,
        qualifying: `${domain}/qualifying.php?season=${season}`
    };

    const keys = {
        race: `raceData-${season}`,
        results: `resultsData-${season}`,
        qualifying: `qualifyingData-${season}`
    };

    // Check if the data is cached
    const cachedData = checkLocalStog(keys[id]);

    if (cachedData) 
    {
        console.log(`Using cached ${id} data for season ${season}`);
        return cachedData;
    }

    console.log(`Fetching ${id} data for season ${season}`);

    // Fetch data from the API and store in localStorage
    const allApis = Object.values(apis);
    const allKeys = Object.values(keys);
    const [raceData, resultsData, qualifyingData] = await fetchData(allApis, allKeys);

    // Return the relevant data for the specified season and type
    return {
        race: raceData, 
        results: resultsData, 
        qualifying: qualifyingData
    };
}

/* 
 * Name: fetchData
 * Parameters: 
 *  - urls (array): An array of API endpoint URLs to fetch data from.
 *  - keys (array): An array of keys corresponding to each URL for storing in localStorage.
 * Return Value: 
 *  - (array): An array of data objects retrieved from the API.
 * Details: 
 *  - Fetches data from multiple API endpoints concurrently.
 *  - Caches the fetched data in localStorage for future use.
 */
async function fetchData(urls, keys)
{
    try 
    {
        const promises = urls.map((url, index) => 
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem(keys[index], JSON.stringify(data));
                    return data;
                })
        );
        return await Promise.all(promises); // Return the array of data objects
    } catch (error) {
        console.error('Error fetching data', error);
        throw error; // Re-throw the error to be caught in the calling function
    }
}

/* 
 * Name: checkLocalStog
 * Parameters: 
 *  - key (string): The key to check in localStorage.
 * Return Value: 
 *  - (object | null): The parsed data from localStorage, or null if not found.
 * Details: 
 *  - Retrieves and parses cached data from localStorage by the given key.
 */
function checkLocalStog(key)
{
    const storedData = localStorage.getItem(`${key}`)
    
    if (storedData)
    {
        return JSON.parse(storedData); // Return the parsed data
    }
    else
    {
        console.log(`No cached data found for ${key}`);
        return null; // Return null if no data is found
    }
}

/*  
 * Name: displayData
 * Parameters: 
 *  - data (object): The data to display (e.g., races, results, or qualifying).
 *  - id (string): The ID of the HTML element where data will be rendered.
 *  - raceName (string | null): The name of the race to filter results (optional).
 * Return Value: None
 * Details: 
 *  - Clears existing content in the target HTML element.
 *  - Populates the target element with new data using the `populate` function.
 *  - Ensures the body background is locked to prevent scrolling.
 */
function displayData(data, id, raceName = null)
{
    // Get the target element by its ID
    const element = document.getElementById(`${id}`);
    // Clear existing content
    element.innerHTML = "";

    // Check if data is an object with nested properties
    if (data.race || data.results || data.qualifying) 
    {
        // Access the correct property based on id
        const displayData = data[id.split('-')[0]]; // This will get 'race' from 'race-content'
        populate(displayData, element, id, raceName);
    } 
    else 
    {
        // If data is already in the correct format
        populate(data, element, id, raceName);
    }
    // Locked the body background to prevent scrolling
    document.body.classList.add('no-scroll');
}

/* 
 * Name: populate
 * Parameters: 
 *  - data (array): The data to populate the HTML element (e.g., race or result data).
 *  - element (HTMLElement): The target HTML element to populate.
 *  - id (string): The ID of the target HTML element.
 *  - raceName (string | null): The name of the race for filtering data (optional).
 * Return Value: None
 * Details: 
 *  - Dynamically generates table rows based on the provided data.
 *  - Filters results or qualifying data when the race name is provided.
 */
function populate(data, element, id, raceName = null)
{
    // Check to ensure data is an array
    if (!Array.isArray(data)) 
    {
        console.error('Expected an array but got:', data);
        return;
    }

    // Populate the race content
    if (id == 'race-content')
    {
        data.forEach(e => {
            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-gray-700');
            row.innerHTML = populateInnerHTML(id, e);
            // Add click handler for the results button
            handleResultsButton(e, row);
            element.appendChild(row);
        });
    }
    // Populate the results content
    if (id == 'results-content')
    {
        const filteredResults = data.filter(r => r.race.name === raceName);

        filteredResults.forEach(result => {
            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-gray-700');
            row.innerHTML = populateInnerHTML(id, result);
            element.appendChild(row);
        });
    }
    // Populate the qualifying content
    if (id == 'qualifying-content')
    {
        const filteredQualifying = data.filter(q => q.race.name === raceName);

        filteredQualifying.forEach(qualifying => {
            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-gray-700');
            row.innerHTML = populateInnerHTML(id, qualifying);
            element.appendChild(row);
        });
    }
}

/*
 * Name: populateInnerHTML
 * Purpose: Generates and returns an HTML string for populating table rows based on the given ID and data.
 * Parameters:
 *  - id (string): The ID of the table content section (e.g., 'race-content', 'results-content', 'qualifying-content').
 *  - data (object): The data object containing details about the content to populate (e.g., race, results, or qualifying data).
 * Return Value:
 *  - (string): An HTML string for a table row tailored to the specified `id` and `data`.
 * Details:
 *  - Dynamically constructs table row content for various contexts (races, results, qualifying).
 *  - Includes interactive elements (e.g., buttons, click events) and fallback values for missing data.
 *  - Escapes JSON data for safe inclusion in `onclick` attributes.
 * Assumptions:
 *  - The `data` object contains appropriate fields for the specified `id` (e.g., `round`, `driver`, `constructor`).
 *  - Helper functions like `displayDriver`, `displayConst`, and popup functions are defined and functional.
 */
function populateInnerHTML(id, data)
{
    if (id == 'race-content')
    {
        return `
            <td class="py-2 px-4">${data.round}</td>
            <td class="py-2 px-4">${data.name}</td>
            <td class="py-2 px-4 text-center">
                <button id="results-btn" class="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                Results
                </button>
            </td>
        `;
    }
    else if (id == 'results-content')
    {
        return `
            <td class="py-2 px-6">${data.position}</td>
            <td class="py-2 px-4 cursor-pointer hover:text-blue-400">
                <span onclick="showDriverPopup(${JSON.stringify(data).replace(/"/g, '&quot;')})">
                    ${data.driver.forename} ${data.driver.surname}
                </span>
                ${displayDriver(data.driver)}

            </td>
            <td class="py-2 px-4 cursor-pointer hover:text-blue-400">
                <span onclick="showConstructorPopup(${JSON.stringify(data).replace(/"/g, '&quot;')})">
                    ${data.constructor.name}
                </span>
                ${displayConst(data.constructor)}
            </td>
            <td class="py-2 px-4">${data.laps || 'N/A'}</td>
            <td class="py-2 px-4">${data.points || 'N/A'}</td>
        `;
    }
    else if (id == 'qualifying-content')
    {
        return `
            <td class="py-2 px-6">${data.position}</td>
            <td class="py-2 px-4 cursor-pointer hover:text-blue-400">
                <span onclick="showDriverPopup(${JSON.stringify(data).replace(/"/g, '&quot;')})">
                    ${data.driver.forename} ${data.driver.surname}
                </span>
                ${displayDriver(data.driver)}
            </td> 
            <td class="py-2 px-4 cursor-pointer hover:text-blue-400">
                <span onclick="showConstructorPopup(${JSON.stringify(data).replace(/"/g, '&quot;')})">
                    ${data.constructor.name}
                </span>
                ${displayConst(data.constructor)}
            </td>
            <td class="py-2 px-4">${data.q1 || 'N/A'}</td>
            <td class="py-2 px-4">${data.q2 || 'N/A'}</td>
            <td class="py-2 px-4">${data.q3 || 'N/A'}</td>
        `;
    }

    return '';
}

/* 
 * Name: handleResultsButton
 * Parameters: 
 *  - element (object): The race object containing details like name, year, and circuit.
 *  - row (HTMLElement): The row element where the results button is rendered.
 * Return Value: None
 * Details: 
 *  - Handles the click event for the "Results" button.
 *  - Fetches and displays results and qualifying data for the selected race.
 *  - Updates the podium and additional race details dynamically.
 */
function handleResultsButton(element, row)
{
    const resultsButton = row.querySelector('#results-btn');
    
    resultsButton.addEventListener('click', async (e) => {
        
        const resultsView = document.getElementById('results-view');
        const raceNameElement = document.getElementById('race-name');
        const seasonYearElement = document.getElementById('season-year');
        
        raceNameElement.textContent = element.name;    
        seasonYearElement.textContent = element.year;
        
        // Fetch and display results for this race
        const resultData = await processData(element.year, 'results');
        const qualifyingData = await processData(element.year, 'qualifying');

        const raceResults = resultData.filter(r => r.race.name === element.name);

        if (raceResults.length > 0)
        {
            displayPodium(raceResults);
        }

        //display the race details
        document.getElementById('race-details').innerHTML = 
            `
                <h1 class="text-xl text-white m-2 font-semibold"><i class="mr-2">Race Name:</i> <span class="font-normal text-md">${element.name}</span></h1>
                <h1 class="text-xl text-white m-2 font-semibold"><i class="mr-2">Round:</i> <span class="font-normal text-md">${element.round}</span></h1>
                <h1 class="text-xl text-white m-2 font-semibold"><i class="mr-2">Year:</i> <span class="font-normal text-md">${element.year}</span></h1>
                <h1 class="text-xl text-white m-2 font-semibold"><i class="mr-2">Circuit:</i> 
                    <span class="cursor-pointer hover:text-blue-400 font-normal">    
                        <span onclick="showCircuitPopup(${JSON.stringify(element.circuit).replace(/"/g, '&quot;')})">
                            ${element.circuit.name} 
                        </span>
                    </span>
                </h1>
                <h1 class="text-xl text-white m-2 font-semibold"><i class="mr-2">Date:</i> <span class="font-normal text-md">${element.date}</span></h1>
                <h1 class="text-xl text-white m-2 font-semibold"><i class="mr-2"><a class="text-blue-600 hover:text-blue-700" href="${element.url}">Wikipedia</a></i></h1>
            `; 

        // Pass the race name to filter results
        displayData(resultData, 'results-content', element.name);
        // Pass the race name to filter qualifying
        displayData(qualifyingData, 'qualifying-content', element.name);

        // Show results view
        resultsView.classList.remove('hidden');
        resultsView.style.display = "flex";

        showResultsView();
    });
}

/* 
 * Name: displayPodium
 * Parameters: 
 *  - raceResults (array): An array of race result objects, sorted by position.
 * Return Value: None
 * Details: 
 *  - Displays the top three drivers (podium) from the race results.
 *  - Adds event listeners for each podium position to show driver details in a popup.
 */
function displayPodium(raceResults)
{
    const firstPlace = document.getElementById('first-place');
    const secondPlace = document.getElementById('second-place');
    const thirdPlace = document.getElementById('third-place');

    // Add classes for visual styles
    firstPlace.classList.add('text-xl', 'cursor-pointer', 'hover:text-blue-400');
    secondPlace.classList.add('text-xl', 'cursor-pointer', 'hover:text-blue-400');
    thirdPlace.classList.add('text-xl', 'cursor-pointer', 'hover:text-blue-400');

    firstPlace.textContent = raceResults[0]?.driver.forename + " " + raceResults[0]?.driver.surname || 'N/A';
    secondPlace.textContent = raceResults[1]?.driver.forename + " " + raceResults[1]?.driver.surname || 'N/A';
    thirdPlace.textContent = raceResults[2]?.driver.forename + " " + raceResults[2]?.driver.surname || 'N/A';

    firstPlace.addEventListener('click', () => {
        showDriverPopup(raceResults[0]);
    });

    secondPlace.addEventListener('click', () => {
        showDriverPopup(raceResults[1]);
    });

    thirdPlace.addEventListener('click', () => {
        showDriverPopup(raceResults[2]);
    });
}

/* 
 * Name: showDriverPopup
 * Parameters: 
 *  - data (object): The driver data to display in the popup.
 * Return Value: None
 * Details: 
 *  - Displays a popup with driver details and race results.
 *  - Allows adding/removing the driver to/from favorites.
 */
function showDriverPopup(data) 
{
    // Parse the data if it's still in JSON string format
    if (typeof data === "string") 
    {
        data = JSON.parse(data);
    }

    const popup = document.getElementById('popup-template');
    const title = document.getElementById('popup-title');
    const content = document.getElementById('popup-content');

    // Check if the driver is already in favorites
    const driverName = `${data.driver.forename} ${data.driver.surname}`;
    const isFavorite = favorites.drivers.includes(driverName);

    // Update the title with driver name
    title.textContent = `${driverName} - Driver Details`;

    // Filter results for this driver
    const filteredResults = checkLocalStog('resultsData-' + data.race.year)?.filter(
        result => result.driver.forename === data.driver.forename && result.driver.surname === data.driver.surname
    );

    // Build the table for race results
    const raceResultsTable = `
        <div class="max-h-[calc(100vh-300px)] overflow-y-auto">
            <table class="min-w-full bg-gray-200 text-black text-sm rounded-md">
                <thead class="bg-gray-100 sticky top-0">
                    <tr>
                        <th class="py-2 px-4 text-left">Rnd</th>
                        <th class="py-2 px-4 text-left">Name</th>
                        <th class="py-2 px-4 text-left">Pos</th>
                        <th class="py-2 px-4 text-left">Points</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredResults
                        .map(
                            result => `
                        <tr class="border-b border-gray-200">
                            <td class="py-2 px-4">${result.race.round}</td>
                            <td class="py-2 px-4">${result.race.name}</td>
                            <td class="py-2 px-4">${result.position}</td>
                            <td class="py-2 px-4">${result.points}</td>
                        </tr>
                    `
                        )
                        .join('')}
                </tbody>
            </table>
        </div>
    `;

    // Populate the popup content
    content.innerHTML = `
        <div class="flex flex-col md:flex-row gap-4">
            <!-- Driver Details -->
            <div class="flex-1">
                <p><strong>Name:</strong> ${driverName}</p>
                <p><strong>Nationality:</strong> ${data.driver.nationality}</p>
                ${favoriteButton(data, isFavorite, 'Driver')}
            </div>

            <!-- Race Results Table -->
            <div class="flex-1">
                <h3 class="font-semibold mb-2">Race Results</h3>
                ${raceResultsTable}
            </div>
        </div>
    `;

    // Show the popup
    popup.classList.remove('hidden');
    // Disable background interaction
    document.getElementById('main-section').classList.add('disable-interaction');
    closePopup(popup);
}

/* 
 * Name: showConstructorPopup
 * Parameters: 
 *  - data (object): The constructor data object to display in the popup.
 * Return Value: None
 * Details: 
 *  - Displays details of the selected constructor, including race results.
 *  - Allows users to toggle the constructor as a favorite.
 */
function showConstructorPopup(data) 
{
    // Parse the data if it's still in JSON string format
    if (typeof data === "string") 
    {
        data = JSON.parse(data);
    }

    const popup = document.getElementById('popup-template');
    const title = document.getElementById('popup-title');
    const content = document.getElementById('popup-content');

    // Check if the constructor is already in favorites
    const isFavorite = favorites.constructors.includes(data.constructor.name);

    // Update the title with constructor name
    title.textContent = `${data.constructor.name} - Constructor Details`;

    // Filter results for this constructor
    const filteredResults = checkLocalStog('resultsData-' + data.race.year)?.filter(
        result => result.constructor.name === data.constructor.name
    );

    // Build the table for race results
    const raceResultsTable = `
        <div class="max-h-[calc(100vh-300px)]">
            <table class="min-w-full bg-gray-200 text-black text-sm rounded-md">
                <thead class="bg-gray-100 sticky top-0">
                    <tr>
                        <th class="py-2 px-4 text-left">Rnd</th>
                        <th class="py-2 px-4 text-left">Name</th>
                        <th class="py-2 px-4 text-left">Driver</th>
                        <th class="py-2 px-4 text-left">Pos</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredResults
                        .map(
                            result => `
                        <tr class="border-b border-gray-200">
                            <td class="py-2 px-4">${result.race.round}</td>
                            <td class="py-2 px-4">${result.race.name}</td>
                            <td class="py-2 px-4">${result.driver.forename} ${result.driver.surname}</td>
                            <td class="py-2 px-4">${result.position}</td>
                        </tr>
                    `
                        )
                        .join('')}
                </tbody>
            </table>
        </div>
    `;

    // Populate the popup content
    content.innerHTML = `
        <div class="flex flex-col md:flex-row gap-2">
            <!-- Constructor Details -->
            <div class="flex-1">
                <p><strong>Name:</strong> ${data.constructor.name}</p>
                <p><strong>Nationality:</strong> ${data.constructor.nationality}</p>
                ${favoriteButton(data, isFavorite, 'Constructor')}
            </div>

            <!-- Race Results Table -->
            <div class="flex-1 overflow-y-auto max-h-60">
                <h3 class="font-semibold mb-2">Race Results</h3>
                ${raceResultsTable}
            </div>
        </div>
    `;

    // Show the popup
    popup.classList.remove('hidden');
    // Disable background interaction
    document.getElementById('main-section').classList.add('disable-interaction');
    closePopup(popup);
}

/* 
 * Name: showCircuitPopup
 * Parameters: 
 *  - data (object): The circuit data object to display in the popup.
 * Return Value: None
 * Details: 
 *  - Displays details of the selected circuit, including location and Wikipedia link.
 *  - Allows users to toggle the circuit as a favorite.
 */
function showCircuitPopup(data) 
{
    // Parse the data if it's still in JSON string format
    if (typeof data === "string") 
    {
        data = JSON.parse(data);
    }
    
    const popup = document.getElementById('popup-template');
    const title = document.getElementById('popup-title');
    const content = document.getElementById('popup-content');

    // Check if the circuit is already in favorites
    const isFavorite = favorites.circuits.includes(data.name);

    // Update the title with circuit name
    title.textContent = `${data.name} - Circuit Details`;

    // Populate the popup content
    content.innerHTML = `
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Country:</strong> ${data.country}</p>
        <p><a href="${data.url}" target="_blank" class="text-blue-500 hover:underline">Wikipedia</a></p>
        ${favoriteButton(data, isFavorite, 'Circuit')}
    `;

    // Show the popup
    popup.classList.remove('hidden');
    // Disable background interaction
    document.getElementById('main-section').classList.add('disable-interaction');
    closePopup(popup);
}

/*
 * Name: favoriteButton
 * Purpose: Generates an HTML button for adding or removing items from favorites.
 * Parameters:
 *  - data (object): The data object containing details about the item (e.g., Circuit, Constructor, Driver).
 *  - isFavorite (boolean): Indicates whether the item is currently marked as a favorite.
 *  - type (string): The type of the item (e.g., 'Circuit', 'Constructor', 'Driver').
 * Return Value:
 *  - (string): An HTML string representing a styled button with the appropriate onclick event and text.
 * Details:
 *  - Dynamically constructs the button text and functionality based on the item's type and favorite status.
 *  - Uses template literals for dynamic data insertion and event generation.
 * Assumptions:
 *  - The `data` object contains appropriate fields (`name`, `constructor`, `driver`) based on the `type`.
 *  - Functions like `toggle{Type}Favorite` and `displayHeart` are defined and handle the corresponding logic.
 * Libraries: None
 */
function favoriteButton(data, isFavorite, type)
{
    // Get the name of the item based on the type
    const name = type === 'Circuit' ? data.name : 
                type === 'Constructor' ? data.constructor.name : 
                data.driver.forename + ' ' + data.driver.surname;
    // Generate the function call for the button
    // toggle${type}Favorite will be called with the name of the item 
    // type will be either Circuit, Constructor, or Driver
    const functionCall = `toggle${type}Favorite('${name}', this), 
            displayHeart('${name}', '${type == 'Circuit' ? 'circuits' : type == 'Constructor' ? 'constructors' : 'drivers'}')`;
    
    return `
        <button
            data-name="${name}"
            data-type="${type}"
            class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md mt-4"
            onclick="${functionCall}">
            ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
    `;
}

/* 
 * Name: showFavoritesPopup
 * Parameters: None
 * Return Value: None
 * Details: 
 *  - Displays all the favorites (drivers, constructors, circuits) in a popup.
 *  - Provides an option to clear all favorites.
 */
function showFavoritesPopup() 
{
    const popup = document.getElementById('popup-template');
    const title = document.getElementById('popup-title');
    const content = document.getElementById('popup-content');

    title.textContent = 'Favorites';

    // Generate the content for favorites
    content.innerHTML = `
        <div class="grid grid-cols-3 gap-4">
            <div>
                <h3 class="font-semibold">Drivers</h3>
                <ul id="favorites-drivers">${favorites.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
            </div>
            <div>
                <h3 class="font-semibold">Constructors</h3>
                <ul id="favorites-constructors">${favorites.constructors.map(c => `<li>${c}</li>`).join('')}</ul>
            </div>
            <div>
                <h3 class="font-semibold">Circuits</h3>
                <ul id="favorites-circuits">${favorites.circuits.map(c => `<li>${c}</li>`).join('')}</ul>
            </div>
        </div>
        <button
            id="clear-favorites"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md mt-4"
        >
            Empty Favorites
        </button>
    `;

    // to clear favorites
    document.getElementById('clear-favorites').addEventListener('click', () => {
        clearFavorites();
    });

    popup.classList.remove('hidden');
    closePopup(popup);
}

/* 
 * Name: saveToFavorite
 * Parameters: 
 *  - type (string): The category of favorites (e.g., 'drivers', 'constructors', 'circuits').
 *  - name (string): The name of the favorite item to add.
 * Return Value: None
 * Details: 
 *  - Adds the specified item to the corresponding favorites list.
 *  - Updates the localStorage with the modified favorites list.
 */
function saveToFavorite(type, name) 
{
    if (!favorites[type].includes(name)) 
    {
        favorites[type].push(name);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        console.log(`Added ${name} to ${type} favorites`);
    }
    else 
    {
        console.log(`${name} is already in ${type} favorites`);
    }
}

/* 
 * Name: clearFavorites
 * Parameters: None
 * Return Value: None
 * Details: 
 *  - Clears all favorites (drivers, constructors, circuits).
 *  - Updates the UI and localStorage to reflect the cleared state.
 */
function clearFavorites() 
{
    // Clear all favorites
    favorites.drivers = [];
    favorites.constructors = [];
    favorites.circuits = [];

    // Save the empty favorites object to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // Refresh the favorites UI
    document.getElementById('favorites-drivers').innerHTML = '';
    document.getElementById('favorites-constructors').innerHTML = '';
    document.getElementById('favorites-circuits').innerHTML = '';

    console.log('All favorites cleared.');

    document.querySelectorAll('#fav-button').forEach(btn => {
        btn.classList.add('text-gray-500');
        btn.textContent = '♡';
    });
}

/* 
 * Name: closePopup
 * Parameters: 
 *  - popup (HTMLElement): The popup element to be closed.
 * Return Value: None
 * Details: 
 *  - Handles the closing of a popup when triggered by buttons or clicking outside the popup.
 */
function closePopup(popup) {
    const closeButton = popup.querySelector('#close-popup');
    const closeBottom = popup.querySelector('#close-popup-bottom');
  
    const closePopup = () => {
      popup.classList.add('hidden');
      // Re-enable background interaction
      document.getElementById('main-section').classList.remove('disable-interaction');
    };
  
    closeButton.addEventListener('click', closePopup);
    closeBottom.addEventListener('click', closePopup);
  
    popup.addEventListener('click', (e) => {
      if (e.target === popup) 
        closePopup();
    });
}

/* 
 * Name: toggleFavorite
 * Parameters: 
 *  - type (string): The type of favorite (e.g., "drivers", "constructors", "circuits").
 *  - name (string): The name of the favorite to add or remove.
 *  - element (HTMLElement): The HTML element triggering the action (optional).
 * Return Value: None
 * Details: 
 *  - Toggles the specified favorite between added and removed states.
 *  - Updates the favorites list and saves it to localStorage.
 */
function toggleFavorite(type, name) 
{
    if (!favorites[type]) 
    {
        return console.error(`Invalid favorite type: ${type}`);
    }

    const index = favorites[type].indexOf(name);
    const isFavorite = index > -1;

    if (isFavorite) 
    {
        favorites[type].splice(index, 1); // Remove from favorites
    } 
    else 
    {
        favorites[type].push(name); // Add to favorites
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));

    //Update all heart icons for the same name and type
    document.querySelectorAll(`button[data-name="${name}"][data-type="${type}"]`).forEach((btn) => {
        btn.classList.add(`${isFavorite ? 'text-gray-500' : 'text-red-500'}`);
        btn.textContent = isFavorite ? '♡' : '♥';
    });

    console.log(`${name} ${isFavorite ? 'removed from' : 'added to'} ${type} favorites`);
}

/* 
 * Name: toggleConstructorFavorite
 * Parameters: 
 *  - name (string): The name of the constructor to toggle as a favorite.
 *  - button (HTMLElement): The button element associated with the toggle action.
 * Return Value: None
 * Details: 
 *  - Toggles a constructor as a favorite by adding or removing it from the favorites list.
 *  - Updates the UI and localStorage accordingly.
 */
function toggleConstructorFavorite(name, button) 
{
    const index = favorites.constructors.indexOf(name);
    const isFavorite = index > -1;

    if (isFavorite) 
    {
        // Remove the constructor from favorites
        favorites.constructors.splice(index, 1);
        console.log(`${name} removed from constructor favorites`);
        button.textContent = 'Add to Favorites';
    } 
    else 
    {
        // Add the constructor to favorites
        favorites.constructors.push(name);
        console.log(`${name} added to constructor favorites`);
        button.textContent = 'Remove from Favorites';
    }

    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));

    document.querySelectorAll(`button[data-name="${name}"][data-type="constructors"]`).forEach((btn) => {
        btn.classList.add(`${isFavorite ? 'text-gray-500' : 'text-red-500'}`);
        btn.textContent = isFavorite ? '♡' : '♥';
    });
}

/* 
 * Name: toggleDriverFavorite
 * Parameters: 
 *  - name (string): The name of the driver to toggle as a favorite.
 *  - button (HTMLElement): The button element associated with the toggle action.
 * Return Value: None
 * Details: 
 *  - Toggles a driver as a favorite by adding or removing it from the favorites list.
 *  - Updates the UI and localStorage accordingly.
 */
function toggleDriverFavorite(name, button) 
{
    const index = favorites.drivers.indexOf(name);
    const isFavorite = index > -1;

    if (isFavorite) 
    {
        // Remove the driver from favorites
        favorites.drivers.splice(index, 1);
        console.log(`${name} removed from driver favorites`);
        button.textContent = 'Add to Favorites';
    } 
    else 
    {
        // Add the driver to favorites
        favorites.drivers.push(name);
        console.log(`${name} added to driver favorites`);
        button.textContent = 'Remove from Favorites';
    }
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // Update all heart icons for the same name
    document.querySelectorAll(`button[data-name="${name}"][data-type="drivers"]`).forEach((btn) => {
        btn.classList.add(`${isFavorite ? 'text-gray-500' : 'text-red-500'}`);
        btn.textContent = isFavorite ? '♡' : '♥';
    });
}

/* 
 * Name: toggleCircuitFavorite
 * Parameters: 
 *  - name (string): The name of the circuit to toggle as a favorite.
 *  - button (HTMLElement): The button element associated with the toggle action.
 * Return Value: None
 * Details: 
 *  - Toggles a circuit as a favorite by adding or removing it from the favorites list.
 *  - Updates the UI and localStorage accordingly.
 */
function toggleCircuitFavorite(name, button) 
{
    const index = favorites.circuits.indexOf(name);

    if (index > -1) 
    {
        // Remove the circuit from favorites
        favorites.circuits.splice(index, 1);
        console.log(`${name} removed from circuit favorites`);
        button.textContent = 'Add to Favorites';
    } 
    else 
    {
        // Add the circuit to favorites
        favorites.circuits.push(name);
        console.log(`${name} added to circuit favorites`);
        button.textContent = 'Remove from Favorites';
    }

    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

/* 
 * Name: showResultsView
 * Parameters: None
 * Return Value: None
 * Details: 
 *  - Unlocks scrolling on the background and shows the results view element.
 */
function showResultsView() 
{
    // Lock the background
    document.body.classList.add('no-scroll');

    // Show the results view
    const resultsView = document.getElementById('results-view');
    resultsView.classList.remove('hidden'); // Make it visible
}

/* 
 * Name: hideResultsView
 * Parameters: None
 * Return Value: None
 * Details: 
 *  - Unlocks scrolling on the background and hides the results view element.
 */
function hideResultsView() 
{
    // Unlock the backgroundFa
    document.body.classList.remove('no-scroll');

    // Hide the results view
    const resultsView = document.getElementById('results-view');
    resultsView.classList.add('hidden');
}

/*
 * Name: displayHeart
 * Purpose: Generates an HTML button to display a heart icon indicating an item's favorite status.
 * Parameters:
 *  - name (string): The name of the item (e.g., circuit, driver, constructor).
 *  - type (string): The type of the item (e.g., 'circuits', 'drivers', 'constructors').
 * Return Value:
 *  - (string): An HTML string for a heart button, styled and toggled based on the favorite status.
 * Details:
 *  - Checks if the item is in the `favorites` list for the specified type.
 *  - Dynamically applies styles (`text-red-500` for favorite, `text-gray-500` for non-favorite).
 *  - Includes an `onclick` event to toggle the item's favorite status.
 * Assumptions:
 *  - The global `favorites` object exists and tracks favorite items by type.
 *  - The `toggleFavorite` function is defined and updates the favorite status appropriately.
 */
function displayHeart(name, type) 
{
    const isFavorite = favorites[type].includes(name);
    return `
        <span>
            <button 
                id='fav-button'
                data-name="${name}" 
                data-type="${type}" 
                onclick="toggleFavorite('${type}', '${name}')" 
                class="bg-transparent border-none cursor-pointer text-xl ${isFavorite ? 'text-red-500' : 'text-gray-500'}">
                ${isFavorite ? '♥' : '♡'}
            </button>
        </span>
    `;
}

/*
 * Name: displayDriver
 * Purpose: Generates a heart button to indicate and toggle a driver's favorite status.
 * Parameters:
 *  - driver (object): An object containing the driver's details, including `forename` and `surname`.
 * Return Value:
 *  - (string): An HTML string for a heart button representing the driver's favorite status.
 * Details:
 *  - Combines the driver's forename and surname as the unique identifier for the favorite status.
 *  - Calls the `displayHeart` function to generate the button.
 * Assumptions:
 *  - The `displayHeart` function is defined and handles the favorite logic and HTML generation.
 */
function displayDriver(driver) 
{
    return displayHeart(`${driver.forename} ${driver.surname}`, 'drivers');
}

/*
 * Name: displayConst
 * Purpose: Generates a heart button to indicate and toggle a constructor's favorite status.
 * Parameters:
 *  - constructor (object): An object containing the constructor's details, including its `name`.
 * Return Value:
 *  - (string): An HTML string for a heart button representing the constructor's favorite status.
 * Details:
 *  - Uses the constructor's name as the unique identifier for the favorite status.
 *  - Calls the `displayHeart` function to generate the button.
 * Assumptions:
 *  - The `displayHeart` function is defined and handles the favorite logic and HTML generation.
 */ 
function displayConst(constructor) 
{
    return displayHeart(constructor.name, 'constructors');
}

