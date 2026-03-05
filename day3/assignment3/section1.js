     //SECTION1

// 1. Program that takes a string and prints its length
let str = "JavaScript";
console.log("Length:", str.length);

function checkNumber(value) {
    return typeof value === "number";
}


// 2. Function that checks if a value is a number
console.log(checkNumber(25));     // true
console.log(checkNumber("25"));   // false



// 3. Convert string "123" into number 123
let str1= "123";
let num = Number(str);

console.log(num);
console.log(typeof num);



// 4. Compare two numbers
let a = 10;
let b = 20;

if (a > b) {
    console.log("Greater");
} 
else if (a < b) {
    console.log("Smaller");
} 
else {
    console.log("Equal");
}


// 5. Join first name and last name
let firstName = "Rahul";
let lastName = "Sharma";

let fullName = firstName + " " + lastName;

console.log(fullName);