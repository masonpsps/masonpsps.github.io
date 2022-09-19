let savedCities = [];
const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const cityList = document.querySelector('.carousel').querySelector('ul');
const toggleSwitch = document.querySelector('.switch input[type="checkbox"]');
const scrollContainer = document.querySelector('.carousel');
const track = document.querySelector('.scrollbar-track');
const thumb = document.querySelector('.scrollbar-thumb');
const sideNav = document.querySelector('#sidenav');
const header = document.querySelector('.main-page');
const mainPage = document.querySelector('.container.main-page');
const darkenOverlay = document.querySelector('.darken-filter');
const popupContainer = document.querySelector('.popup-container');
const textArea = document.querySelector('.text-list textarea');
const dateContainer = document.querySelector('.date');
let btns = document.querySelectorAll('.btn');
let addBtn = null;
let today = new Date();

window.onload = (e) => {
    if(true) {      // maybe leave as light mode default
        toggleSwitch.checked = true;
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    dateContainer.innerHTML = `${weekday[today.getDay()]}, ${today.getMonth() + 1} / ${today.getDate()}`;
    displayCards();
}
async function displayCards() {
    cityList.innerHTML = '';
    addCard('empty');
    savedCities = await getFromLocalStorage();
    console.log(savedCities);
    
    passCardsFromLS();
}

// WEATHER DATA handlers
async function getWeatherData(city) {
    const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=3e7def59b7e4f35237a5e546f3378a28`);
    // const resp = await fetch(`https://cors-anywhere.herokuapp.com/https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=3e7def59b7e4f35237a5e546f3378a28`);
    let info = await resp.json();
    const icon = await fetch(`https://openweathermap.org/img/wn/${info.weather[0].icon}@2x.png`);
    // const icon = await fetch(`https://cors-anywhere.herokuapp.com/http://openweathermap.org/img/wn/${info.weather[0].icon}@2x.png`);
    const imgBlob = await icon.blob();
    const imgURL = URL.createObjectURL(imgBlob);
    info.icon = imgURL;
    return info;
}

// CARD DISPLAY handlers
async function addCard(city) {
    if(city === 'empty') {
        cityList.innerHTML += `
            <li>
                <div class="city-card">
                    <div class="city-name">Add City</div>
                    <div class="current-info">
                        <div class="weather-img" onclick="showPopup(true)">
                            <!-- TODO: add city placeholder img -->
                            <i class="fas fa-circle-plus fa-5x" id="add-btn"></i>
                        </div>
                        <!-- TODO: add local time indicator -->
                        <div class="temp">
                            <span class="curr-temp">--&deg;</span>
                        </div>
                        <div class="weather">Weather</div>
                            <div class="high-low">
                                <div class="high-temp">
                                    --
                                    <span class="max">max</span>
                                </div>
                                <div class="low-temp">
                                    --
                                    <span class="min">min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        `;
        // addBtn = document.querySelector('#add-btn');
        return;
    }
    let i = await getWeatherData(city);
    // console.log(i);
    let info = [
        i.name,        
        Math.round(i.main.temp),
        i.weather[0].main,
        Math.round(i.main.temp_max),
        Math.round(i.main.temp_min),
        i.icon,
    ];
    cityList.innerHTML += `
        <li>
            <div class="city-card">
                <div class="city-name">${info[0]}</div>
                <div class="current-info">
                    <div class="weather-img">
                        <img src="${info[5]}">
                    </div>
                    <div class="temp">
                        <span class="curr-temp">${info[1]}&deg;</span>
                    </div>
                    <div class="weather">${info[2]}</div>
                        <div class="high-low">
                            <div class="high-temp">
                                ${info[3]}
                                <span class="max">max</span>
                            </div>
                            <div class="low-temp">
                                ${info[4]}
                                <span class="min">min</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    `;
}
function passCardsFromLS() {
    const cityListLS = getFromLocalStorage();
    
    cityListLS.forEach(function(city) {
        addCard(city);
    });
}
// function clearCards() {
//     cityList.innerHTML += `
//             <li>
//                 <div class="city-card">
//                     <div class="city-name">Add City</div>
//                     <div class="current-info">
//                         <div class="weather-img" onclick="showPopup(true)">
//                             <!-- TODO: add city placeholder img -->
//                             <i class="fas fa-circle-plus fa-5x" id="add-btn"></i>
//                         </div>
//                         <!-- TODO: add local time indicator -->
//                         <div class="temp">
//                             <span class="curr-temp">--&deg;</span>
//                         </div>
//                         <div class="weather">Weather</div>
//                             <div class="high-low">
//                                 <div class="high-temp">
//                                     --
//                                     <span class="max">max</span>
//                                 </div>
//                                 <div class="low-temp">
//                                     --
//                                     <span class="min">min</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </li>
//         `;
// }

// POPUP MENU handlers
function showPopup(shouldDisplay) {     // showPopup(true) or ..(false)
    if(shouldDisplay) {     
        // called from onclick on empty cards weather-img
        darkenOverlay.style.cssText = `opacity: 0.5;`;
        popupContainer.classList.remove('hidden');
    } else {
        darkenOverlay.style.cssText = `opacity: 0;`;
        popupContainer.classList.add('hidden');
    }
}

// handlers for dark mode toggle switch
function switchTheme(e) {
    (e.target.checked) 
        ? document.documentElement.setAttribute('data-theme', 'dark')
        : document.documentElement.setAttribute('data-theme', 'light');   

    disableClickForDuration(
        toggleSwitch.parentElement, 
        parseFloat(getComputedStyle(toggleSwitch)["transitionDuration"])
    );
}
function disableClickForDuration(el, dur) {     // pass dur in seconds
    el.classList.add('unclickable');
    setTimeout(function() {
        el.classList.remove('unclickable')
    }, dur * 1000);
}

// SIDE NAV handlers
function openNav() {
    sideNav.style.cssText = `width: 250px`;
    header.style.cssText = `
        transition: 0.5s;
        margin-left: 250px;
    `;
    mainPage.style.cssText = `
        transition: 0.5s;
        margin-left: 250px;
    `;
    darkenOverlay.style.cssText = `opacity: 0.5;`;
}
function closeNav() {
    sideNav.style.cssText = `width: 0px;`;
    header.style.cssText = `
        transition: 0.5s;
        margin-left: 0px;
    `;
    mainPage.style.cssText = `
        transition: 0.5s;
        margin-left: 0px;
    `;
    darkenOverlay.style.cssText = `opacity: 0;`;

    // MAKE OPEN CITY LIST SHIFT WITH SIDENAV OPEN
}

// LIST INPUT AND LS 
function updateList() {
    let text = $('.text-list textarea').val().split(/\n/);
    savedCities = [];
    text.forEach(function(line) {
        if(/\S/.test(line)) {
            savedCities.push($.trim(line));
        }
    });
    addToLocalStorage(savedCities);
    
    displayCards();
}
function addToLocalStorage(toLS) {
    localStorage.setItem('cities', JSON.stringify(toLS));
}
function getFromLocalStorage() {
    let stored = JSON.parse(localStorage.getItem('cities'));

    return stored === null ? [] : stored;
}

toggleSwitch.addEventListener('change', switchTheme, false);

scrollContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    scrollContainer.scrollLeft += e.deltaY / 2;
});

btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        if(btn.classList.contains('submit-btn')) {
            // update city list
            updateList();
            showPopup(false);
        } else if(btn.classList.contains('close-btn')) {
            showPopup(false);
        }
    });
});
