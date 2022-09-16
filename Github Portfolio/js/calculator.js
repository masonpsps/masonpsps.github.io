const clearBtn = document.querySelector('#clear');
const equalsBtn = document.querySelector('#equals');
const simpleBtns = document.querySelectorAll('.simple');
const operatorBtns = document.querySelectorAll('.operator');
const numberBtns = document.querySelectorAll('.num');
const display = document.querySelector('.display');
let oldNum = "";
let newNum = "0";
let result = "";
let operator = "";

window.onload = () => {
    newNum = "";
    displayNumber(newNum);
}

function displayNumber(number) {
    display.innerHTML = number.toString().padStart(1, '0');
    if(number === "0" || number === "") {
        
        clearBtn.innerHTML = 'AC';
    } else {
        clearBtn.innerHTML = 'C';
    }
    console.log(oldNum);
}

function clearAll() {
    newNum = "";
    oldNum = "";
    result = "";
    operator = "";

    operatorBtns.forEach(function(btn) {
        btn.classList.remove('active-operation');
    });

    displayNumber(newNum);
}

simpleBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        switch(btn.id) {
            case "negate":
                if(oldNum !== "" && newNum === "") {
                    newNum = (-1 * parseFloat(oldNum));
                    oldNum = "";
                } else {
                    newNum = (-1 * parseFloat(newNum));
                }
                break;
            case "percent":
                if(oldNum !== "" && newNum === "") {
                    newNum = parseFloat(oldNum) / 100;
                    oldNum = "";
                } else {
                    newNum /= 100;
                }
                break;
            case "dot":
                if(newNum.indexOf('.') <= -1) {
                    newNum = newNum.concat('.');
                }
                break;
        }
        displayNumber(newNum);
    });
});

numberBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        newNum = newNum.concat(btn.innerHTML);
        displayNumber(newNum);
    });
});

clearBtn.addEventListener('click', function() {
    if((operator === "" && oldNum !== "") && result !== "") {
        newNum = "";
        displayNumber(newNum);
    } else {
        clearAll();
    }
});

equalsBtn.addEventListener('click', function() {
    switch(operator) {
        case "add":         result = parseFloat(oldNum) + parseFloat(newNum);    break;
        case "subtract":    result = parseFloat(oldNum) - parseFloat(newNum);    break;
        case "multiply":    result = parseFloat(oldNum) * parseFloat(newNum);    break;
        case "divide":      result = parseFloat(oldNum) / parseFloat(newNum);    break;
        default:            result = parseFloat(newNum);                         break;
    }

    if(isNaN(result)) {
        result = "error";
        oldNum = "";
    } else {
        oldNum = result.toString();
    }

    // allows user to chain calculations using the result as the first number
    // eg 2 * 2 = 4 => * 10 = 40 => + 3 = 43
    newNum = "";
    operator = "";
    displayNumber(result);

    operatorBtns.forEach(function(btn) {
        btn.classList.remove('active-operation');
    });
});

operatorBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        if(btn.classList.contains('active-operation')) {
            btn.classList.remove('active-operation');
            operator = "";
            return;
        }
        operatorBtns.forEach(function(other) {
            other.classList.remove('active-operation');
        });        
        btn.classList.add('active-operation');

        operator = btn.id;
        if(oldNum !== "" && newNum === "") {
            // do nothing, old is already filled from result, chaining calculation
        } else {
            // oldNum = newNum;
            (newNum === "") 
                ? oldNum = 0
                : oldNum = newNum;
            newNum = "";
        }
        
        displayNumber(newNum);
    });
});