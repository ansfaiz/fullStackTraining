let cart = [];

cart.push("Shoes");
cart.push("Shirt");

cart.unshift("Urgent Item");

cart.shift();

cart.splice(1,1);
const printer=item => console.log(item);
cart.forEach(printer);