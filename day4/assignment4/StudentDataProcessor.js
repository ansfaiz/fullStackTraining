let students = [
{name:"rahul",marks:85},
{name:"amit",marks:42},
{name:"sara",marks:73}
];

let upperNames = students.map(s => ({
    name: s.name.toUpperCase(),
    marks: s.marks
}));

let passed = students.filter(s => s.marks > 50);

let avg = students.reduce((sum,s)=>sum+s.marks,0) / students.length;

students.forEach(s => console.log(s));

console.log("Uppercase:",upperNames);
console.log("Passed:",passed);
console.log("Average:",avg);