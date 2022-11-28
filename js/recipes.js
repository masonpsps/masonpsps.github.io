// const savedMeals = localStorage.getItem(JSON.parse('savedMeals')) || [];

const savedMealsListEl = document.querySelector('ul.saved');
const popupDisplay = document.querySelector('.popup-content');
const sideNav = document.querySelector('.sidenav');

const dropdown = document.querySelector('.dropdown');
const dropdownList = document.querySelector('.dropdown-list');
const filterCategory = document.querySelector('span.category-list');
const filterIngredient = document.querySelector('span.ingredient-list');
const filterRegion = document.querySelector('span.region-list');
const categorySection = document.querySelector('.category-search-container .filtered-results');
const ingredientSection = document.querySelector('.ingredient-search-container .filtered-results');
const regionSection = document.querySelector('.region-search-container .filtered-results');
const filterDropdowns = document.querySelectorAll('.show-filter');
const refreshDisplays = document.querySelectorAll('.refresh-display');
const containersFilters = document.querySelectorAll('span.filters');
let filters = [[], [], []];
let activeFilter = [[], [], []];

const pulledMeals = [];

function findAllMeals() {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const result = [];
    const fetches = [];
    for(let i = 0; i < alpha.length; i++) {
        fetches.push(
            fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${alpha[i]}`)
            .then(res => res.json())
            .then(json => {
                if(json.meals) {
                    result.push([...json.meals]);
                }
            })
            // .catch(function handleError(error) {
            //     console.log("error " + error);
            // })
        );
    }
    Promise.all(fetches).then(() => {
        pulledMeals.push(result.flat());
        console.log(pulledMeals.flat());
        displayMealSection(categorySection);
    });        
}

function displayMealSection(sectionToDisplay, indicesToShow = randomIndices(4)) {
    let str = '';
    for(let i = 0; i < indicesToShow.length; i++) {
        str += `
            <div class="search-result" onclick="displayPopup(${indicesToShow[i]})">
                <div class="result-img">
                    <img src="${pulledMeals[0][indicesToShow[i]].strMealThumb}" alt="">
                </div>
                <div class="result-banner">
                    <span class="result-name">${pulledMeals[0][indicesToShow[i]].strMeal}</span>
                    <span class="result-fav" onclick="addMealToSavedByID(${pulledMeals[0][indicesToShow[i]].idMeal})">
                    <span onclick="changeHeartOnClick(this)">
                        <i class="far fa-heart"></i>
                    </span>
                    </span>
                </div>
            </div>
        `;
    }
    sectionToDisplay.innerHTML += str;

    console.log(filterMeals('strIngredient', 'Olive Oil'));
}
function randomIndices(howMany = 3, max = pulledMeals[0].length) {
    const arr = [];
    for(let i = 0; i < howMany; i++) {
        arr.push(Math.floor(Math.random() * max));
    }

    return arr;
}
function filterMeals(whatProperty, lookingFor) {
    lookingFor = lookingFor.toLowerCase();
    if(whatProperty === 'strIngredient') {
        const filtered = pulledMeals[0].filter(meal => {
            for(let i = 0; i < 21; i++) {
                let str = meal['strIngredient' + i];
                if(str && str.toLowerCase() === lookingFor) {
                    i = 21;
                    return true;
                }
            }
        });
        return filtered;
    }
    const filtered = pulledMeals[0].filter(meal => {
        return meal[whatProperty].toLowerCase() === lookingFor;
    });
    return filtered;
}

function displayPopup(index) {
    if(!index) {
        popupDisplay.parentElement.parentElement.classList.add('hidden');
        // document.documentElement.style.overflow = 'scroll';
        // document.body.scroll = 'no';
        return;
    }
    
    popupDisplay.parentElement.parentElement.classList.remove('hidden');
    popupDisplay.scrollTo(0, 0);
    // document.documentElement.style.overflow = 'hidden';
    // document.body.scroll = 'yes';

    const meal = pulledMeals[0][index];
    const measuredIngredients = getIngredientsWithMeasurements(meal);
    const formattedDirections = formatDirections(meal);

    popupDisplay.innerHTML = `
        <div class="close-popup" onclick="displayPopupByIndex(false)"><i class="fa fa-close"></i></div>
        <div class="img-title-wrapper">
            <div class="popup-img"><img src="${meal.strMealThumb}" alt="img"></div>
            <div class="popup-title">${meal.strMeal}</div>
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
function getIngredientsWithMeasurements(meal) {
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
        if(meal['strIngredient'.concat(i)]) {
            ingredients[i - 1] = meal['strIngredient'.concat(i)];
            measurements[i - 1] = meal['strMeasure'.concat(i)];
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
function formatDirections(meal) {
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
    let unformatted = meal.strInstructions;
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

findAllMeals();
