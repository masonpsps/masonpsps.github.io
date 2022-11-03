const words = [
    "heavy",
    "light",
    "crane",
    "shtik",
    "pools",
    "stern",
    "still",
    "spell",
    "verse",
    "words",
    "quiet",
    "quite",
    "brown",
    "guest",
    "strip",
    "avoid",
    "party",
    "whole",
    "untie",
    "overt",
    "named"
]
// let answer = words[Math.floor(Math.random() * words.length)].toUpperCase();
let answer = findRandomWord();

const letterContainer = document.querySelector('.letter-container').children;
const keys = document.querySelectorAll('.key');
let currentPosition = 0;
let canBeSubmitted = false;
let guesses = [
    "",
    "",
    "",
    "",
    "",
    ""
];

function submitGuess() {
    if(canBeSubmitted) {
        console.log('submitted');
        canBeSubmitted = false;

        saveGuess();
        // advanceSelectedLetter();
    } else {
        console.log('word is not completed');
    }
}
function saveGuess() {
    let index = Math.floor(currentPosition / 5);
    let guess = '';

    for(let i = currentPosition - 4; i <= currentPosition; i++) {
        guess += letterContainer[i].textContent;
    }

    guesses[index] = guess;
    checkWordIsReal(guess[index]);
    checkLettersForMatches(guesses[index]);
}
function checkWordIsReal(toCheck) {
    let resp = fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${toCheck}`)
    .then(response => response.json()).then(json => {
        if(json[0]) {
            // word is real
            console.log('success');
            checkLettersForMatches(toCheck);
            advanceSelectedLetter();
        }
    });
}
function checkLettersForMatches(wordToCheck) {    
    for(let i = 0; i < wordToCheck.length; i++) {
        let charToCheck = wordToCheck.charAt(i);
        let classToAdd = '';
        
        if(answer.indexOf(charToCheck) <= -1) {
            classToAdd = 'no-match';
        } else if(answer.indexOf(charToCheck) !== i) {
            classToAdd = 'partial-correct';
        } else {
            classToAdd = 'full-correct';
        }
        letterContainer[currentPosition - 4 + i].classList.add(classToAdd);
        changeClassForKeyboardDisplay(charToCheck, classToAdd);
    }
}
function changeClassForKeyboardDisplay(whatLetter, whatClass) {
    keys.forEach(key => {
        if(key.textContent.toLowerCase() === whatLetter.toLowerCase()) {
            key.classList.add(whatClass);
        }
    });
}
function advanceSelectedLetter() {
    letterContainer[currentPosition].classList.remove('selected');
    currentPosition++;
    letterContainer[currentPosition].classList.add('selected');
}
function performBackspace() {
    letterContainer[currentPosition].textContent = '';

    if(currentPosition % 5 !== 0) {
        letterContainer[currentPosition].classList.remove('selected');
        currentPosition--;
        letterContainer[currentPosition].classList.add('selected');
    }
}

function keyPressHandler(e) {

    console.log(answer);

    if(e.key && e.key.length <= 1) {
        letterContainer[currentPosition].textContent = e.key.toUpperCase();
        if(currentPosition % 5 === 4) {
            canBeSubmitted = true;
            return;
        }
        advanceSelectedLetter();
    } else if(e.key === 'Enter') {
        submitGuess();
    } else if(e.key === 'Backspace') {
        performBackspace();
    }
}

window.addEventListener('keydown', keyPressHandler);

function findRandomWord() {
    let x = fetch('https://random-word-api.herokuapp.com/word?length=5')
    .then(response => response.json()).then(json => {
        console.log(json);
        answer = json;
        return json;
    });
    // x = x.json();

    
}