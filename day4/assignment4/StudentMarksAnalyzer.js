let marks = [];

for(let i=0;i<5;i++){
    marks.push(Number(prompt("Enter mark " + (i+1))));
}

marks.push(60);
marks.pop();

marks.forEach(m => console.log(m));

let increased = marks.map(m => m + 5);
console.log(increased);

let passed = marks.filter(m => m > 40);
console.log(passed);

let total = marks.reduce((sum,m) => sum + m, 0);
console.log("Total Marks:", total);