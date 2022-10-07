let savedMeals = [];

const savedListElement = document.querySelector('ul.saved');
const popupDisplay = document.querySelector('.popup-content');
const sideNav = document.querySelector('.sidenav');
const dropdown = document.querySelector('.dropdown');
const dropdownList = document.querySelector('.dropdown-list');
const filterCategory = document.querySelector('span.category-list');
const filterIngredient = document.querySelector('span.ingredient-list');
const filterRegion = document.querySelector('span.region-list');
const randomFilteredC = document.querySelector('.category-search-container .filtered-results');
// const randomFilteredI = document.querySelector('.ingredient-list .filtered-results');
// const randomFilteredR = document.querySelector('.region-list .filtered-results');
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
    // TODO:    add functionality to filters
}

function showPopup(mealInfo) {
    if(mealInfo === false) {
        popupDisplay.parentElement.parentElement.classList.add('hidden');
        return;
    }
    
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
    let unformatted = mealInfo.meals[0].strInstructions;
    let n = unformatted.split(/\r\n/g);
    let formattedDir = '';
    let stepNum = 1;
    for(let i = 0; i < n.length; i++) {
        if(n[i] !== "" && n[i] !== " ") {
            if(/^(\s*\d+.\s*)/i.test(n[i])) {
                // n[i] = n[i].split(/^(\s*STEP\s*\d*|\s*\d+.*\s*)/gi);
                // let blah = n[i].match(/^(\s*STEP\s*\d*|\s*\d+.*\s*)/i);
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

function addMealToSaved(mealToAdd) {
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
async function fillMealsOnLoad(mealsList) {
    for(let i = 0; i < mealsList.length; i++) {
        let meal = await findMealInfo('id', mealsList[i][0]);
        addMealToSaved(meal);
    }
}
async function findMealInfo(searchType, str) {
    let info = [];
    let resp = '';

    if(str === undefined && searchType !== 'random') {
        console.log('no str defined, defaulting to random search');
        searchType = 'random';
    }
    switch(searchType) {
        case 'id':
            resp = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${str}`);
            break;
        case 'name':
            resp = await fetch(`www.themealdb.com/api/json/v1/1/search.php?s=${str}`);
            break;
        case 'random':
            resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            break;
        default:    // random search
            resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            break;
    }

    // let resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    // let resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=Fish+Fofos');

    info = resp.json();

    return info;
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

async function initializeFilters() {
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
            findMealsByFilters(0);
        });
}

function displayFilters(from, toElement, strValue) {
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
function findMealsByFilters(filterType) {
    let letter = 'c';
    switch (filterType) {
        case 0:         letter = 'c';      break;
        case 1:         letter = 'i';      break;
        case 2:         letter = 'a';      break;
        default:        letter = 'c';      break;
    }

    let resp = fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?${letter}=${activeFilter[filterType]}`)
        .then(response => response.json())
        .then((json) => {
            if(json.meals !== null) {
                console.log(json);
                let r = [
                    Math.floor(Math.random() * json.meals.length), 
                    Math.floor(Math.random() * json.meals.length), 
                    Math.floor(Math.random() * json.meals.length)
                ];
                displayNonSavedMeal('random', json.meals[r[0]]);
                displayNonSavedMeal(filterType, json.meals[r[1]]);
                displayNonSavedMeal(filterType, json.meals[r[2]]);
            } else {

            }

        });
}

function selectFilter(selectedFilter) {
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

    findMealsByFilters(whichType);
}
function displayNonSavedMeal(filterType, meal) {
    // let elem = randomFilteredC;
    // switch (filterType) {
    //     case 0:     elem = randomFilteredC;     break;
    //     default:    elem = randomFilteredC;     break;
    // }

    // if(filterType === 'random' || !filterType) {
    //     meal = findMealInfo();
    //     meal = meal.meals[0];        
    // }

    let str = `
        <div class="search-result">
            <div class="result-img">
                <img src="{meal.strMealThumb}" alt="">
            </div>
            <div class="result-banner">
                <span class="result-name">{meal.strMeal}</span>
                <span class="result-fav"><i class="fa fa-heart"></i></span>
            </div>
        </div>
    `;

    randomFilteredC.innerHTML += str;
    console.log(meal);

}

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
