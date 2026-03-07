let names = ["  rahul  ","  amit","sara  "];

let formatted = names.map(n => {
    let clean = n.trim();
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
});

console.log(formatted);