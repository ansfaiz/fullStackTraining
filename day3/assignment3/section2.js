         //SECTION2 -> FUNCTION

// 1. Function expression to add two numbers
const add = function(a, b) {
    return a + b;
};

console.log(add(10, 20));

// 2. Function and Arrow Function for square of a number

    //Normal Function
function square(num) {
    return num * num;
}
console.log(square(5));
 
  //Arrow Function
const squareArrow = (num) => num * num;
console.log(squareArrow(5));


//3. Lambda function to check even or odd
const checkEvenOdd = (num) => {
    if (num % 2 === 0) {
        return "Even";
    } else {
        return "Odd";
    }
};

console.log(checkEvenOdd(10));

//4. Temperature conversion functions

  // Celsius to Fahrenheit
function celsiusToFahrenheit(c) {
    return (c * 9/5) + 32;
}
console.log(celsiusToFahrenheit(25));
  
   //Fahrenheit to Celsius
function fahrenheitToCelsius(f) {
    return (f - 32) * 5/9;
}
console.log(fahrenheitToCelsius(77));

//5. Convert normal function to arrow function
  //normal funtion
function multiply(a, b) {
    return a * b;
}
  //Arrow function
const multiplybyArrow = (a, b) => a * b;
