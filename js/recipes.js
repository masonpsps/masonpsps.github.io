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
    });        
}

findAllMeals();