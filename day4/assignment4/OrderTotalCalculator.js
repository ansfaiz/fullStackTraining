let orders = [200,500,700];

let total = orders.reduce((sum,o)=>sum+o,0);

let taxed = orders.map(o => o * 1.18);

alert("Total Bill: " + total);
alert("With Tax: " + taxed);