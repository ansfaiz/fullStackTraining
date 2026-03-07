let sentence = prompt("Enter sentence");

let clean = sentence.trim().toLowerCase();

let words = clean.split(" ");

let count = words.length;

console.log("Word count:", count);