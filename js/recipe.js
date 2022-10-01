const savedMeals = [];

const savedListElement = document.querySelector('ul.saved');
const popupDisplay = document.querySelector('.popup-content');

window.onload = (e) => {
    fillMealsOnLoad();
}

function showPopup(mealInfo) {
    let measuredIngredients = getIngredientsWithMeasurements(mealInfo);
    let formattedDirections = formatDirections(mealInfo);
    
    popupDisplay.innerHTML = `
        <div class="close-popup"><i class="fa fa-close"></i></div>
        <div class="popup-img"><img src="${mealInfo.meals[0].strMealThumb}" alt="img"></div>
        <div class="popup-title">${mealInfo.meals[0].strMeal}</div>
        <div class="ingredients">
            Ingredients
            <ul class="ingredient-list">
                ${measuredIngredients}
            </ul>
        </div>
        <div class="directions">
            Directions
            <p class="full-directions">${formattedDirections}</p>
        </div>
    `;
    // console.log(mealInfo.meals[0].strInstructions);
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
    let regex = /\r\n/g;
    let n = unformatted.split(regex);
    let formattedDir = '';
    for(let i = 0; i < n.length; i++) {
        if(n[i] !== "" && n[i] !== " ") { 
            formattedDir += `
                <p>Step ${i + 1}</p>
                <p>${n[i]}</p>
            `; 
         }
    }
    

    return formattedDir;
}

function addMealToSaved(mealToAdd) {
    savedListElement.innerHTML += `
        <li>
            <div class="saved-preview">
                <img src="${mealToAdd.meals[0].strMealThumb}" alt="img">
            </div>
            <p class="saved-name">${mealToAdd.meals[0].strMeal}</p>
        </li>
    `;
}
async function fillMealsOnLoad() {
    for(let i = 0; i < 4; i++) {
        let meal = await findRandomMealInfo();
        addMealToSaved(meal);
    }
    let rand = await findRandomMealInfo();
    showPopup(rand);
}
async function findRandomMealInfo() {
    let info = [];
    let resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    info = resp.json();

    return info;
}