const minutes = document.querySelector('.min');
const seconds = document.querySelector('.sec');
const mseconds = document.querySelector('.msec');
const startBtn = document.querySelector('.start-btn');
const resetBtn = document.querySelector('.reset-btn');
const lapBtn = document.querySelector('.lap-btn');
const sideNav = document.querySelector('.sidenav');
const dropdown = document.querySelector('.dropdown');
const dropdownList = document.querySelector('.dropdown-list');
const lapRecord = document.querySelector('.lap-record');
// const $ = window.jQuery;
let startTime = 0;
let t;
let state = 0;
let elapsedTime = 0;
let date = 0;
let lapNow = null;
let lastLap = 0;
let lapTime = { min: 0, sec: 0, msec: 0};
let lapNumber = 1;
let currentLapTime = document.querySelector('.current-lap p.lap-time');
let diff = 0, prevDiff = 0;

// TODO: add lap button functionality

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
    lastLap = 0;
    state = 0;
    lapNumber = 1;
    lapTime = {
        min: 0,
        sec: 0,
        msec: 0
    };

    startBtn.innerHTML = 'Start';

    // lapRecord.innerHTML = `
    //     <li class="current-lap">
    //         <p>Lap <span class="lap-number">1</span></p>
    //         <p class="lap-time" id="lap-1">
    //             <span class="lap-min">00</span>:
    //             <span class="lap-sec">00</span>.
    //             <span class="lap-msec">00</span>
    //         </p>                     
    //     </li>`
    // ;
    lapRecord.innerHTML = '';
    addLap(lapNumber, lapTime.min, lapTime.sec, lapTime.msec);
}

function updateTime() {
    date = Date.now();
    elapsedTime = Date.now() - startTime;

    minutes.innerHTML = parseTime(elapsedTime, 'min');
    seconds.innerHTML = parseTime(elapsedTime, 'sec');
    mseconds.innerHTML = parseTime(elapsedTime, 'msec');

    lapTime = { 
        min: parseTime(elapsedTime - lastLap, 'min'), 
        sec: parseTime(elapsedTime - lastLap, 'sec'), 
        msec: parseTime(elapsedTime - lastLap, 'msec')
    };
    updateCurrentLap();
}

function parseTime(time, unit) {
    let parsedTimeUnit = 0;
    switch(unit) {
        case 'min':
            parsedTimeUnit = Math.floor(time / 60000) % 60;
            parsedTimeUnit = parsedTimeUnit.toString().padStart(2, '0');
            break;
        case 'sec':
            parsedTimeUnit = Math.floor(time / 1000) % 60;
            parsedTimeUnit = parsedTimeUnit.toString().padStart(2, '0');
            break;
        case 'msec':
            parsedTimeUnit = time % 1000;
            parsedTimeUnit = parsedTimeUnit.toString().padStart(3, '0').substring(0, 2);
            break;
    }
    
    return parsedTimeUnit;
}

function updateCurrentLap() {
    let currLapNow = `
        <span class="lap-min">${lapTime.min}</span>:
        <span class="lap-sec">${lapTime.sec}</span>.
        <span class="lap-msec">${lapTime.msec}</span>
    `;
    currentLapTime.innerHTML = currLapNow;
}

function lapTimer() {
    diff = elapsedTime - lastLap;

    let str = '';
    if (diff < prevDiff + 10 && diff > prevDiff - 10) {
        // do nothing
    } else if(diff > prevDiff) {
        str = 'slower-anim';
    } else if(diff < prevDiff) {
        str = 'faster-anim';
    }
    if(str) { 
        let id = currentLapTime.id;
        $(`#${id}`)?.addClass(str)
        .delay($(`#${id}`)?.eq(0)?.css('animation-duration')?.slice(0, -1) * 1000 || 1500)
        .queue( 
            function() {
                $(`#${id}`).removeClass(str);
            }
        );
    }
    prevDiff = diff;
    lastLap = elapsedTime;

    currentLapTime.parentElement.classList.remove('current-lap');

    lapNumber++;
    addLap(lapNumber, lapTime.min, lapTime.sec, lapTime.msec);
}
function addLap(lapNum, lapMin, lapSec, lapMsec) {
    let listItem = document.createElement('li');
    listItem.classList.add('current-lap');
    listItem.innerHTML = `
        <p>Lap <span class="lap-number">${lapNum}</span></p>
        <p class="lap-time" id="lap-${lapNum}">
            <span class="lap-min">${lapMin.toString().padStart(2, '0')}</span>:
            <span class="lap-sec">${lapSec.toString().padStart(2, '0')}</span>.
            <span class="lap-msec">${lapMsec.toString().padStart(2, '0')}</span>
        </p>
    `;
    lapRecord.appendChild(listItem);
    currentLapTime = document.querySelector('.current-lap p.lap-time');
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

window.onload = () => {
    // lapRecord.innerHTML = `                    
    //     <li class="current-lap">
    //         <p>Lap <span class="lap-number">1</span></p>
    //         <p class="lap-time" id="lap-1">
    //             <span class="lap-min">00</span>:
    //             <span class="lap-sec">00</span>.
    //             <span class="lap-msec">00</span>
    //         </p>                            
    //     </li>
    // `;
    addLap(1, 0, 0, 0);

    currentLapTime = document.querySelector('.current-lap p.lap-time');
}

startBtn.addEventListener('click', function() {
    (state === 0 || state === 2)
        ? startTimer()
        : pauseTimer();
});
resetBtn.addEventListener('click', resetTimer);
lapBtn.addEventListener('click', lapTimer);