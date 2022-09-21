const minutes = document.querySelector('.min');
const seconds = document.querySelector('.sec');
const mseconds = document.querySelector('.msec');
// const btns = document.querySelectorAll('.btn');
const startBtn = document.querySelector('.start-btn');
const resetBtn = document.querySelector('.reset-btn');
const sideNav = document.querySelector('.sidenav');
const dropdown = document.querySelector('.dropdown');
const dropdownList = document.querySelector('.dropdown-list');
let startTime = 0;
let t;
let state = 0;
let elapsedTime = 0;
let date = 0;

// TODO: add lap button functionality

// btns.forEach(function(btn) {
//     btn.addEventListener('click', function() {
//         if(btn.classList.contains('start-btn')) {
//             switch(state) {
//                 // default, timer at zero and not started
//                 case 0:     startTimer();    btn.innerHTML = "pause";    break;
//                 // timer has been started, currently running
//                 case 1:     pauseTimer();    btn.innerHTML = "resume";   break;
//                 // timer has been started, currently paused
//                 case 2:     startTimer();    btn.innerHTML = "pause";    break;
//             }
//         } else if(btn.classList.contains('reset-btn')) {
//             resetTimer();
//             btns.forEach((btn) => {
//                 if(btn.classList.contains('start-btn')) {
//                     btn.innerHTML = "start";
//                 }
//             });
//         } 
//         // else if(btn.classList.contains('lap-btn')) {
//         //     lapTimer();
//         // }
//     });
// });

startBtn.addEventListener('click', function() {     // probably should be by classes
    (state === 0 || state === 2)
        ? startTimer()
        : pauseTimer();
});

resetBtn.addEventListener('click', () => {
    resetTimer();
});


function startTimer() {
    startTime = Date.now() - elapsedTime;
    state = 1;
    t = setInterval(updateTime, 10);
    
    startBtn.innerHTML = 'Pause';
}

function pauseTimer() {
    clearInterval(t);
    state = 2;

    startBtn.innerHTML = 'Resume';
}

function resetTimer() {
    clearInterval(t);
    mseconds.innerHTML = "00";
    seconds.innerHTML = "00";
    minutes.innerHTML = "00";
    elapsedTime = 0;
    state = 0;

    startBtn.innerHTML = 'Start';
}

function updateTime() {
    date = Date.now();
    elapsedTime = Date.now() - startTime;
    let ms = elapsedTime % 1000;
    let s = Math.floor(elapsedTime / 1000) % 60;
    let m = Math.floor(elapsedTime / 60000) % 60;

    mseconds.innerHTML = ms.toString().padStart(3, '0').substring(0, 2);
    seconds.innerHTML = s.toString().padStart(2, '0');
    minutes.innerHTML = m.toString().padStart(2, '0');
}

function openNav() {
    sideNav.style.cssText = 'width: 250px;';
}
function closeNav() {
    sideNav.style.cssText = 'width: 0px;';
}

function dropdownMenu() {
    // let elem = document.querySelector('.dropdown');
    dropdown.classList.toggle('show-dropdown');
    dropdownList.classList.toggle('hide-dropdown');
    dropdownList.classList.toggle('border');
}