let email = prompt("Enter email:");

let atIndex = email.indexOf("@");

let domain = email.slice(atIndex+1);

let newDomain = domain.replace("gmail","company");

console.log(domain);
console.log(newDomain);