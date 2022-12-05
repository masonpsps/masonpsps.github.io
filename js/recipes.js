const savedMeals = JSON.parse(localStorage.getItem('savedMeals')) || ["52777", "52827"];
const pulledMeals = [];

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
const filters = {
    ingredientsFilters: [
        "Chicken",
        "Beef",
        "Pork",
        "Salmon",
        "Pasta",
        "Rice",
        "Beans",
        "Cheese",
        "Mushroom",
        "Chocolate",
        "Curry Powder",
        "Eggplant",
        "Egg",
        "Olive Oil",
        "Lentils",
        "Potato",
        "Yogurt",
        "Sausage",
        "Peanut"
    ],
};
const filterDisplays = [filterCategory, filterIngredient, filterRegion];

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
        displayMealSection(ingredientSection);
        displayMealSection(regionSection);
        displaySavedMeals();
        populateFilters(filters);
    });        
}

function populateFilters(filter) {
    const catArray = pulledMeals[0].map(item => item.strCategory);
    const areaArray = pulledMeals[0].map(item => item.strArea);
    [filter.categoryFilters, filter.areaFilters] = [[...new Set(catArray)], [...new Set(areaArray)]];
    // console.log(filter);
    for(let i = 0; i < Object.values(filter).length; i++) {
        let location = filterDisplays[i] || filterCategory;
        // console.log(i);
        for(let j = 0; j < Object.values(filter)[i].length; j++) {
            location.innerHTML += `
                <div class="filter-item" onclick="selectFilter(this)">
                    ${Object.values(filter)[i][j]}
                </div>
            `;
        }
    }
}

function displayMealSection(sectionToDisplay, indicesToShow = randomIndices(4)) {
    let str = '';
    for(let i = 0; i < indicesToShow.length; i++) {
        const item = pulledMeals[0][indicesToShow[i]];
        const heart = (savedMeals.some(id => item.idMeal === id.toString()))
            ? 'far fa-heart' 
            : 'fa fa-heart';
        str += `
            <div class="search-result" onclick="displayPopup(${indicesToShow[i]})">
                <div class="result-img">
                    <img src="${pulledMeals[0][indicesToShow[i]].strMealThumb}" alt="">
                </div>
                <div class="result-banner">
                    <span class="result-name">${pulledMeals[0][indicesToShow[i]].strMeal}</span>
                    <span 
                        onclick="
                            addMealToSaved(${pulledMeals[0][indicesToShow[i]].idMeal}, this); 
                            event.stopPropagation();
                        "
                        class="result-fav" 
                    >
                        <i class="${heart}"></i>
                    </span>
                </div>
            </div>
        `;
        // event.stopPropagation() stops the displayPopup onclick firing when the heart is clicked
        //      so only gets saved, no popup
    }
    sectionToDisplay.innerHTML += str;
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

function displaySavedMeals() {
    const arr = pulledMeals[0].filter(item => 
        savedMeals.some(id => 
            item.idMeal === id.toString()
        )
    );

    arr.forEach(item => {
        const index = pulledMeals[0].indexOf(item);
        savedMealsListEl.innerHTML += `
            <li onclick="displayPopup(${index})">
                <div class="saved-preview">
                    <img src="${item.strMealThumb}" alt="img">
                </div>
                <p class="saved-name">${item.strMeal}</p>
            </li>
        `;
    });
}

function displayPopup(index) {
    if(!index) {
        popupDisplay.parentElement.parentElement.classList.add('hidden');
        return;
    }
    
    popupDisplay.parentElement.parentElement.classList.remove('hidden');
    popupDisplay.scrollTo(0, 0);

    const meal = pulledMeals[0][index];
    const measuredIngredients = getIngredientsWithMeasurements(meal);
    const formattedDirections = formatDirections(meal);

    popupDisplay.innerHTML = `
        <div class="close-popup" onclick="displayPopup(false)">
            <i class="fa fa-close"></i>
        </div>
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
    relatively inconsistent however(some directions already contain step 
    labels as STEP X or X.) so regex implemented to remove array elements
    or substrings matching those formats
    */
    const stepSpaceNumberRegex = /^(STEP\s*\d*.*|\s*\d+\s*.*)/gi;
    const unformatted = meal.strInstructions;
    let dir = unformatted.split(/\r\n/g);
    let formattedDir = '';
    console.log(dir);
    dir = dir.filter(item => {
        item = item.replace(stepSpaceNumberRegex, '');
        return item !== '' && item !== ' ';
    });
    console.log(dir);
    for(let i = 0; i < dir.length; i++) {
        formattedDir += `
            <p class="direction-step">Step ${i + 1}</p>
            <p>${dir[i]}</p>
        `;
    }

    return formattedDir;
}

function addMealToSaved(id, element) {
    // check if meal is already saved in savedMeals and add isSaved property to it in pulledMeals
    const isPresent = savedMeals.some(item => item === id);
    isPresent 
        ? savedMeals.splice(savedMeals.indexOf(id), 1)
        : savedMeals.push(id);
    localStorage.setItem('savedMeals', JSON.stringify(savedMeals));

    pulledMeals[0].find(meal => meal.idMeal === id.toString()).isSaved = isPresent;

    // change heart between filled and outline
    const el = element.children[0];
    if(el.classList.contains('far')) {
        el.classList.remove('far');
        el.classList.add('fa');
    } else {
        el.classList.remove('fa');
        el.classList.add('far');
    }
}

filterDropdowns.forEach((btn) => {
    btn.addEventListener('click', () => {
        btn.parentElement.parentElement.querySelector('.filters').classList.toggle('expanded');
    });
});

findAllMeals();
