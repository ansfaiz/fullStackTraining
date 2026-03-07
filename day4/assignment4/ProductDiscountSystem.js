let prices = [500,1200,80,1500,300];

let discounted = prices.map(p => p * 0.9);
console.log(discounted);

let firstAbove1000 = prices.find(p => p > 1000);
console.log(firstAbove1000);

let below100 = prices.some(p => p < 100);
console.log(below100);

let above50 = prices.every(p => p > 50);
console.log(above50);