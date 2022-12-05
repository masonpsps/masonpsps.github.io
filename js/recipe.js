let savedMeals = [];

const savedListElement = document.querySelector('ul.saved');
const popupDisplay = document.querySelector('.popup-content');
const sideNav = document.querySelector('.sidenav');
const dropdown = document.querySelector('.dropdown');
const dropdownList = document.querySelector('.dropdown-list');
const filterCategory = document.querySelector('span.category-list');
const filterIngredient = document.querySelector('span.ingredient-list');
const filterRegion = document.querySelector('span.region-list');
const filterSections = [
    document.querySelector('.category-search-container .filtered-results'),
    document.querySelector('.ingredient-search-container .filtered-results'),
    document.querySelector('.region-search-container .filtered-results')
];
const filDropdowns = document.querySelectorAll('.show-filter');
const refreshDisplays = document.querySelectorAll('.refresh-display');
const containersFilters = document.querySelectorAll('span.filters');
let filters = [[], [], []];
let activeFilter = [[], [], []];

// TODO:    functioning search bar
//          fav/remove from favs recipes
//          auto display random/suggested recipes under favs
//          add custom recipes to save to local storage?

window.onload = (e) => {
    let mealsLS = getFromLocalStorage();
    fillMealsOnLoad(mealsLS);

    initializeFilters();

    loadMealsByFilter(3, 0);    // category
    loadMealsByFilter(3, 1);    // ingredient
    loadMealsByFilter(3, 2);    // region/area
    // TODO:    add functionality to filters
}

// popup display and formatting ingredients/directions
function showPopup(mealInfo) {
    /*
    This function displays the popup for a meal when clicked on
    and displays relevant information for that meal
    and calls the functions to format the meals ingredients and directions

    the popup is instead hidden if no arguments are given
    */
    if(mealInfo === false) {
        popupDisplay.parentElement.parentElement.classList.add('hidden');
        document.documentElement.style.overflow = 'scroll';
        document.body.scroll = 'no';
        return;
    }
    
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = 'yes';
    popupDisplay.parentElement.parentElement.classList.remove('hidden');
    popupDisplay.scrollTo(0, 0);

    let measuredIngredients = getIngredientsWithMeasurements(mealInfo);
    let formattedDirections = formatDirections(mealInfo);

    popupDisplay.innerHTML = `
        <div class="close-popup" onclick="showPopup(false)"><i class="fa fa-close"></i></div>
        <div class="img-title-wrapper">
            <div class="popup-img"><img src="${mealInfo.meals[0].strMealThumb}" alt="img"></div>
            <div class="popup-title">${mealInfo.meals[0].strMeal}</div>
        </div>
        <div class="ingredients">
            <span class="section-title">Ingredients</span>
            <ul class="ingredient-list">
                ${measuredIngredients}
            </ul>
        </div>
        <div class="directions">
            <span class="section-title">Directions</span>
            <p class="full-directions">${formattedDirections}</p>
        </div>
    `;

}
function getIngredientsWithMeasurements(mealInfo) {
    /*
    This function formats the ingredients from the given meal
    and fills a list containing the measurement and corresponding
    ingredient

    API lists ingredients as strIngredient# and measurements as strMeasurement#
    where # is from 1 to 20
    */
    let measurements = [];
    let ingredients = [];
    let ingrListString = '';

    for(let i = 1; i < 21; i++) {
        if(mealInfo.meals[0]['strIngredient'.concat(i)] !== ""
            && mealInfo.meals[0]['strIngredient'.concat(i)] !== null) {
            ingredients[i - 1] = mealInfo.meals[0]['strIngredient'.concat(i)];
            measurements[i - 1] = mealInfo.meals[0]['strMeasure'.concat(i)];
        } else {
            break;
        }
    }
    for(let i = 0; i < measurements.length; i++) {
        ingrListString += `
            <li>
                <span class="measurement">${measurements[i]} </span>
                <span class="ingredient">${ingredients[i]}</span>
            </li>
        `;
    }

    return ingrListString;
}
function formatDirections(mealInfo) {
    /*
    This function formats the directions from the given meal and
    returns a string with a label for each step followed by the 
    instruction for that step

    API stores directions as a single string with new steps generally
    designated by \r\n so regex is used to split the string into an array
    relatively inconsistent however(many directions already contain step 
    labels as STEP X or X.) so regex implemented to remove array elements
    or substrings matching those formats
    */
    let unformatted = mealInfo.meals[0].strInstructions;
    let n = unformatted.split(/\r\n/g);
    let formattedDir = '';
    let stepNum = 1;
    for(let i = 0; i < n.length; i++) {
        if(n[i] !== "" && n[i] !== " ") {
            if(/^(\s*\d+.\s*)/i.test(n[i])) {
                n[i] = n[i].replace(/^(\s*STEP\s*\d*|\s*\d+.\s*)/i, '');
            } else if(/^(\s*STEP\s*\d*)/i.test(n[i])) {
                n[i] = '';
            }
            if(n[i] !== '' && n[i] !== " ") {
                formattedDir += `
                    <p class="direction-step">Step ${stepNum}</p>
                    <p class="">${n[i]}</p>
                `;
                stepNum++; 
            }
        }
    }    
    return formattedDir;
}

// handling saved meals and local storage
function addMealToSaved(mealToAdd) {
    /*
    This function adds a specified meal to the array 
    containing any other meals that have been saved by the user
    and creates an html element to display in the relevant section
    */
    savedMeals.push(mealToAdd);
    let index = savedMeals.indexOf(mealToAdd);

    savedListElement.innerHTML += `
        <li onclick="showPopup(savedMeals[${index}])">
            <div class="saved-preview">
                <img src="${mealToAdd.meals[0].strMealThumb}" alt="img">
            </div>
            <p class="saved-name">${mealToAdd.meals[0].strMeal}</p>
        </li>
    `;
    
}
function addToLocalStorage(toSave) {
    let allInfo = [];
    for(let i = 0; i < toSave.length; i++) {
        let savedInfo = [toSave[i].meals[0].idMeal, toSave[i].meals[0].strMeal];
        allInfo.push(savedInfo);
    }
    localStorage.setItem('savedRecipes', JSON.stringify(allInfo));
}
function getFromLocalStorage() {
    let stored = JSON.parse(localStorage.getItem('savedRecipes'));

    return stored === null ? [] : stored;
}


async function fillMealsOnLoad(mealsList) {
    for(let i = 0; i < mealsList.length; i++) {
        // let meal = await findMealInfo('id', mealsList[i][0]);
        // addMealToSaved(meal);
        let meal = await findMealInfo('id', mealsList[i][0], true);
    }
}
async function findMealInfo(searchType, str, shouldAddToSaved) {
    let info = [];
    let resp = '';
    let urlToFetch = 'https://www.themealdb.com/api/json/v1/1/random.php';

    if(str === undefined && searchType !== 'random') {
        searchType = 'random';
    }
    switch(searchType) {
        case 'id':
            urlToFetch = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${str}`;
            break;
        case 'name':
            urlToFetch = `https://www.themealdb.com/api/json/v1/1/search.php?s=${str}`;
            break;
        default:
            urlToFetch = `https://www.themealdb.com/api/json/v1/1/random.php`;
            break;
    }
    resp = fetch(urlToFetch).then(response => response.json()).then((json) => {
        // addMealToSaved(json);
        if(shouldAddToSaved) {
            addMealToSaved(json);
        }
    });
    // info = resp.json();
    // return info;
}

// fetching and displaying filter options
async function initializeFilters() {
    /*
    This function fetches all filters available
    from the MealDB API and places them in
    a 2d array and finally passes each sub array
    to the displayFilters function to be displayed
    */
    let categList = fetch(`https://www.themealdb.com/api/json/v1/1/list.php?c=list`)
        .then(response => response.json())
        .then((json) => {
            filters[0] = json;
            displayFilters(filters[0].meals, filterCategory, 'strCategory');
        }
    );
    let ingrList = fetch(`https://www.themealdb.com/api/json/v1/1/list.php?i=list`)
        .then(response => response.json())
        .then((json) => {
            filters[1] = json;
        });
    let regionList = fetch(`https://www.themealdb.com/api/json/v1/1/list.php?a=list`)
        .then(response => response.json())
        .then((json) => {
            filters[2] = json;
            displayFilters(filters[2].meals, filterRegion, 'strArea');
            // findMealsByFilters(0);
        });
}
function displayFilters(from, toElement, strValue) {
    /*
    This function creates html elements 
    for each of the values present in the from array 
    by concatenating to a string and
    setting the inner html of the specified element to that string
    */
    let strTemp = '';
    for(let i = 0; i < from.length; i++) {
        strTemp += `
            <div class="filter-item" onclick="selectFilter(this)">
                ${from[i][strValue]}
            </div>
        `;
    }
    toElement.innerHTML = strTemp;
}

// selecting filter and refreshing filtered results
function selectFilter(selectedFilter) {
    /*
    This function is called by the displayed filters
    on click which passes itself
    and toggles the relevant selected class before checking
    whether the element should be added or removed from the active filter array
    and finally calls the function to reload the displayed filtered recipes
    */
    selectedFilter.classList.toggle('selected-filter');
    let whichType = 0;

    if(selectedFilter.classList.contains('selected-filter')) {
        activeFilter[whichType].push(selectedFilter.outerText);
    } else {
        activeFilter[whichType]
            .splice(activeFilter[whichType].indexOf(selectedFilter.outerText), 1);
    }

    if(selectedFilter.parentElement.classList.contains('category-list')) {
        whichType = 0;
    } else if(selectedFilter.parentElement.classList.contains('ingredient-list')) {
        whichType = 1;
    } else if(selectedFilter.parentElement.classList.contains('region-list')) {
        whichType = 2;
    }

    clearFilterSection(filterSections[whichType]);
    loadMealsByFilter(3, whichType);
}
async function loadMealsByFilter(numToLoad, filterType) {
    /*
    This function grabs a specified number of meals to display
    based on the filter type (category/ingredient/region) and 
    passes each to be displayed,
    the fetch type defaults to a random meal unless the relevant filter 
    type array is not empty in which case a meal is fetched using the filter
    */
    let letter = 'c';
    let urlToFetch = 'https://www.themealdb.com/api/json/v1/1/random.php';

    switch(filterType) {
        case 1:         letter = 'i';      break;
        case 2:         letter = 'a';      break;
        default:        letter = 'c';      break;
    }

    if(activeFilter[filterType].length !== 0) {
        urlToFetch = `https://www.themealdb.com/api/json/v1/1/filter.php?${letter}=${activeFilter[filterType]}`;
    } else {
        for(let j = 0; j < numToLoad; j++) {
            let data = fetch(urlToFetch).then(response => response.json()).then((json) => {
                if(!json.meals) {
                    filterSections[filterType].innerHTML = 
                        `
                            <p class="no-matches-msg">
                                No meals matching the filters could be found
                            </p>
                        `;
                    return;
                }
                let num = Math.floor(Math.random() * json.meals.length);
                displayFilteredMeal(filterType, json.meals[(num + j) % json.meals.length]);
            });            
        }

        return;
    }

    let data = fetch(urlToFetch).then(response => response.json()).then((json) => {
        if(!json.meals) {
            filterSections[filterType].innerHTML = 
                `
                    <p class="no-matches-msg">
                        No meals matching the filters could be found
                    </p>
                `;
            return;
        }
        let num = Math.floor(Math.random() * json.meals.length);
        for(let i = 0; i < Math.min(numToLoad, json.meals.length); i++) {
            displayFilteredMeal(filterType, json.meals[(num + i) % json.meals.length]);
        }
    });
}
function displayFilteredMeal(filterType, meal) {
    /*
    This function creates the display cards for a 
    meal passed to it and appends the element 
    to the relevant html section
    */
    let sectionToUse = filterSections[filterType];

    let str = `
        <div class="search-result" onclick="displayPopupByID(${meal.idMeal})">
            <div class="result-img">
                <img src="${meal.strMealThumb}" alt="">
            </div>
            <div class="result-banner">
                <span class="result-name">${meal.strMeal}</span>
                <span class="result-fav" onclick="addMealToSavedByID(${meal.idMeal})">
                <span onclick="changeHeartOnClick(this)">
                    <i class="far fa-heart"></i>
                </span>
                </span>
            </div>
        </div>
    `;

    sectionToUse.innerHTML += str;
}
function clearFilterSection(sectionToClear) {
    /*
    This function clears the inner html of the
    specified section
    */
    sectionToClear.innerHTML = "";
}
async function displayPopupByID(id) {
    let g = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    g = g.json();

    showPopup(await g);
}
async function addMealToSavedByID(id) {
    let g = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    g = g.json();

    addMealToSaved(await g);
}
function changeHeartOnClick(str) {
    console.log(str);
    console.log(str.childNodes[1]);
    if(str.childNodes[1].classList.contains('far')) {
        str.innerHTML = 
        `
            <span onclick="changeHeartOnClick(this)">
                <i class="fa fa-heart"></i>
            </span>
        `;
    } else {
        str.innerHTML = 
        `
            <span onclick="changeHeartOnClick(this)">
                <i class="far fa-heart"></i>
            </span>
        `;
    }
}


// navbar handlers
function openNav() {
    sideNav.style.cssText = 'width: 250px;';
}
function closeNav() {
    sideNav.style.cssText = 'width: 0px;';
}
function dropdownMenu() {
    dropdown.classList.toggle('show-dropdown');
    dropdownList.classList.toggle('hide-dropdown');
    dropdownList.classList.toggle('border');
}

savedListElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    savedListElement.scrollLeft += e.deltaY / 2;
});

filDropdowns.forEach((btn) => {
    btn.addEventListener('click', () => {
        btn.parentElement.parentElement.querySelector('.filters').classList.toggle('expanded');
    });
});

refreshDisplays.forEach((btn) => {
    btn.addEventListener('click', () => {
        let x;
        if(btn.parentElement.parentElement.classList.contains('category-search-container')) {
            x = 0;
        } else if(btn.parentElement.parentElement.classList.contains('ingredient-search-container')) {
            x = 1;
        } else if(btn.parentElement.parentElement.classList.contains('region-search-container')) {
            x = 2;
        }
        clearFilterSection(filterSections[x]);
        loadMealsByFilter(3, x);
        // console.log(x);
    });
});
