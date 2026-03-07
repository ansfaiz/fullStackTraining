let product = {
    name:"Laptop",
    price:50000
};

Object.freeze(product);

product.price = 60000;

console.log(product);