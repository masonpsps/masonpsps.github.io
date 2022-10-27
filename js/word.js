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
]

function checkEntryOnEnterKey() {
    if(canBeSubmitted) {
        console.log('submitted');
        canBeSubmitted = false;

        advanceSelectedLetter();
    } else {
        console.log('word is not completed');
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
        // letterContainer[currentPosition].textContent = '';
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
        checkEntryOnEnterKey();
    } else if(e.key === 'Backspace') {
        performBackspace();
    }
}

window.addEventListener('keydown', keyPressHandler);