let arr1 = [5,3,8];
let arr2 = [2,9,1];

let merged = [...arr1,...arr2];

merged.sort((a,b)=>a-b);

let result = merged.slice(2);

console.log(result);