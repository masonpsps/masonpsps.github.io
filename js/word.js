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
let answer = words[Math.floor(Math.random() * words.length)].toUpperCase();

const letterContainer = document.querySelector('.letter-container').children;
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
        advanceSelectedLetter();
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
    checkLettersForMatches(guesses[index]);
}
function checkLettersForMatches(wordToCheck) {    
    for(let i = 0; i < wordToCheck.length; i++) {
        let charToCheck = wordToCheck.charAt(i);
        if(answer.indexOf(charToCheck) <= -1) {
            letterContainer[currentPosition - 4 + i].classList.add('no-match');
        } else if(answer.indexOf(charToCheck) !== i) {
            letterContainer[currentPosition - 4 + i].classList.add('partial-correct');
        } else {
            letterContainer[currentPosition - 4 + i].classList.add('full-correct');
        }
    }
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