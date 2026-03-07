let categories = ["Electronics", ["Laptop","Mobile"], ["TV",["LED","OLED"]]];

let flatArray = categories.flat(2);

flatArray.sort();

flatArray.forEach(item => console.log(item));