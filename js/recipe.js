let savedMeals = [];

const savedListElement = document.querySelector('ul.saved');
const popupDisplay = document.querySelector('.popup-content');
const sideNav = document.querySelector('.sidenav');
const dropdown = document.querySelector('.dropdown');
const dropdownList = document.querySelector('.dropdown-list');

window.onload = (e) => {
    let mealsLS = getFromLocalStorage();
    fillMealsOnLoad(mealsLS);
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

// HAVE TO ADD FUNCTIONALITY TO THESE
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
