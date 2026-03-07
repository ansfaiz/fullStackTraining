const sum = (...numbers) => {
    return numbers.reduce((total,n)=>total+n,0);
};

console.log(sum(5,10,15,20));