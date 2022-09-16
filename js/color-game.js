const squares = document.querySelectorAll(".square");
const btns = document.querySelectorAll(".btn");
const colorText = document.querySelector(".color-rgb");
const topSection = document.querySelector('.top-container');
const buttonSection = document.querySelector('.btn-wrapper');
const primaryBGColor = topSection.style.backgroundColor;
const colorspace = document.querySelector('#colorspace');
const label = document.querySelector('label');
const hintCounter = document.querySelector('span#hint-count');
const livesCounter = document.querySelector('span.lives-count');
const scoreCounter = document.querySelector('span.score-count');
const nextHintCounter = document.querySelector('span.next-hint-count');
const nextLifeCounter = document.querySelector('span.next-life-count');
let remainingHints = 3;
let currentScore = 0;
let currentLives = 5;
let nextHintIn = 2;
let nextLifeIn = 3;
let isWaitingForNewGame = false;
// TODO: add score and limit on hints
//          score incremented on correct answer, gain a hint every other correct
//       add togglable limit on how many wrong answers before failure

window.onload = (event) => {
    colorspace.selectedIndex = 0;
    initializeSquares();
    // hintCounter.innerHTML = `${remainingHints}`;
    changeStats(remainingHints, currentLives, currentScore, nextHintIn, nextLifeIn);
}

function changeElementColors(toColor) {
    squares.forEach(function(other) {
        other.classList.remove('hidden');
        other.style.backgroundColor = toColor;
    });    
    btns.forEach(function(btn) {
        btn.style.backgroundColor = toColor;
    });
    topSection.style.backgroundColor = toColor;
    document.querySelector('.btn-container').style.backgroundColor = toColor;
    label.style.backgroundColor = toColor;
}

function isSquareCorrect(currSquare) {
    let isCorrect = (currSquare === colorText.textContent);
    switch(colorspace.selectedIndex) {
        case 0:
            isCorrect = (currSquare === colorText.textContent);
            break;
        case 1:
            isCorrect = (rgbToHex(currSquare) === colorText.textContent);
            break;
        case 2:
            isCorrect = areHSLColorsWithinRange(rgbToHSL(currSquare), 
                                        colorText.textContent, 3, 1.2);
            break;
    }

    return isCorrect;
}
function rgbToHex(rgb) {
    let a = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    delete(a[0]);
    for(let i = 1; i <= 3; i++) {
        a[i] = parseInt(a[i]).toString(16);
        if(a[i].length == 1) a[i] = '0' + a[i];
    }
    return "#" + a.join('');
}
function rgbToHSL(rgb) {
    let a = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    let r = a[1] / 255;
    let g = a[2] / 255;
    let b = a[3] / 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;
    
    if(delta == 0) {
        h = 0;
    } else {
        switch(cmax) {
            case r:     h = ((g - b) / delta) %6;    break;
            case g:     h = (b - r) / delta + 2;     break;
            case b:     h = (r - g) / delta + 4;     break;
        }
        h = Math.round(h * 60);

        if(h < 0) {
            h += 360;
        }
    }

    l = (cmax + cmin) / 2;

    s = delta == 0 
        ? 0 
        : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(0);
    l = +(l * 100).toFixed(0);

    return "hsl(" + h + ", " + s + "%, " + l + "%)";
}
function generateColor() {
    let str = "";
    switch(colorspace.selectedIndex) {
        // RGB 
        case 0:
            let r = Math.floor(Math.random() * 256);
            let g = Math.floor(Math.random() * 256);
            let b = Math.floor(Math.random() * 256);
            str = "rgb(" + r + ", " + g + ", " + b + ")";
            break;
        // HEX
        case 1:
            str = generateHex(6);
            break;
        // HSL
        case 2:
            let h = Math.floor(Math.random() * 360);
            let s = weightedRandom(0, 100, 75);
            let l = weightedRandom(0, 100, 50);
            str = "hsl(" + h + ", " + s + "%, " + l + "%)";
            break;
    }

    return str;
}
function generateHex(length) {
    let mult = "0x";
    for(let i = 0; i < length -  1; i++) {
        mult += "f";
    }
    return "#" 
        + Math.floor(Math.random() * (mult.toString(16) + 1))
        .toString(16)
        .padStart(length, '0');
}
function weightedRandom(min, max, mean) {
    // used to create a "weighted" random number for s% and l% in hsl 
    // intended to avoid significant number of extremely low/high saturation and lightness
    return Math.floor(Math.random () * Math.abs(max - mean)) +
            Math.floor(Math.random() * mean);
}
function areHSLColorsWithinRange(a, b, hVariance, slVariance) {
    // this function is needed due to the rounding of the rgb to hsl value,

    // from testing hVari be around 3 and slVari slightly above 1 around 1.2
    let aHSL = a.match(/\d+/g);
    let bHSL = b.match(/\d+/g);
    let aH = aHSL[0], aS = aHSL[1], aL = aHSL[2];
    let bH = bHSL[0], bS = bHSL[1], bL = bHSL[2];

    return    ((Math.abs(aH - bH) < hVariance) 
            && (Math.abs(aS - bS) < slVariance) 
            && (Math.abs(aL - bL) < slVariance));
}

function initializeSquares() {
    let correctSquare = Math.floor(Math.random() * 6);

    squares.forEach(function(square, index) {
        let squareColor = generateColor();
        square.style.backgroundColor = squareColor;
        square.classList.remove('hidden');

        if(index === correctSquare) {
            colorText.innerHTML = squareColor;
            console.log(squareColor);
        }
    });

    isWaitingForNewGame = false;
}
function changeStats(hints, lives, score, nextHint, nextLife) {
    remainingHints = hints;
    currentScore = score;
    currentLives = lives;
    nextHintIn = nextHint;
    nextLifeIn = nextLife;

    hintCounter.innerHTML = `${remainingHints}`;
    livesCounter.innerHTML = `${currentLives}`;
    scoreCounter.innerHTML = `${currentScore}`;
    nextHintCounter.innerHTML = `${nextHintIn}`;
    nextLifeCounter.innerHTML = `${nextLifeIn}`;
}

function removeRandomSquare() {
    if(remainingHints <= 0) {
        console.log('no more hints');
        return;
    }
    remainingHints -= 1;
    hintCounter.innerHTML = `(${remainingHints})`;

    let remaining = [];
    squares.forEach(function(square, index) {
        if(!square.classList.contains('hidden') 
            // && square.style.backgroundColor !== colorText.textContent) {
            && !isSquareCorrect(square.style.backgroundColor)) {
            remaining.push(index);
        }
    });
    if(remaining.length < 1) {
        console.log("no more options to remove");
        return null;
    }
    let rand = remaining[Math.floor(Math.random() * remaining.length)];

    squares[rand].classList.add('hidden');
}

function changeColorspace() {
    initializeSquares();
}

function correctChosen() {
    // increment score
    currentScore += 1;
    // check if new hint added
    nextHintIn -= 1;
    if(nextHintIn <= 0) {
        nextHintIn = 2;
        remainingHints += 1;
        hintCounter.innerHTML = `${remainingHints}`;

    }
    // check if life restored
    nextLifeIn = Math.max(0, nextLifeIn - 1);
    if(currentLives <= 5 && nextLifeIn <= 0) {
        currentLives += 1;
        nextLifeIn = 3;
    }

    isWaitingForNewGame = true;
    changeStats(remainingHints, currentLives, currentScore, nextHintIn, nextLifeIn);
    setTimeout(function() {
        initializeSquares();
    }, 2000);
}
function incorrectChosen() {
    // lose life
    currentLives -= 1;
    if(currentLives <= 0) {
        alert('no more lives remaining');
        // reset squares and score and hints
        setTimeout(function() {
            // initializeSquares();
            changeStats(3, 5, 0, 2, 3);
        }, 2000);
        return;
    }

    // isWaitingForNewGame = true;
    changeStats(remainingHints, currentLives, currentScore, nextHintIn, nextLifeIn);
}

squares.forEach(function(square) {
    square.addEventListener('click', function() {
        if(isWaitingForNewGame) {
            // initializeSquares();
            console.log('bruh');
            return;
        }
        if(isSquareCorrect(square.style.backgroundColor)) {
            changeElementColors(square.style.backgroundColor);
            correctChosen();
        } else {
            square.classList.add("hidden");
            incorrectChosen();
        }
    });
});

btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        if(btn.classList.contains("new-btn") && !isWaitingForNewGame) {
            initializeSquares();
        } else if(btn.classList.contains("hint-btn") && !isWaitingForNewGame) {
            removeRandomSquare();
        }
    });
});

