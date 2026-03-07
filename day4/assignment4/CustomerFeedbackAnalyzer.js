let feedback = ["good service","average","very good","bad"];

let upper = feedback.map(f => f.toUpperCase());

let goodComments = feedback.filter(f => f.indexOf("good") !== -1);

console.log(upper);
console.log(goodComments);