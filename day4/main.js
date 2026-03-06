// alert("welcome to page");
// const username= prompt("enter your name ");
// console.log("hello "+ username);
// const age= prompt("enter your age ");
// console.log(typeof parseInt(age) +1);
// const num= prompt("enter a number ");
// if(num%2==0){
//     console.log( "number is even");
// }else{
//     console.log("number is odd");
// }

//callBack
/* const add=function(a,b){return a+b};
const minus =(a,b)=>a-b;
const helper=(a,b,cb)=>cb(a,b);
console.log(helper(1,2,add));
console.log(helper(4,2,minus)); */

//Array
/* const arr =[344,34,2,3,5,243,54];
console.log(arr);
console.log(arr.pop());
console.log(arr);
console.log(arr.push(100));
console.log(arr);
console.log(arr.shift(3));
console.log(arr);
console.log(arr.unshift(5));
console.log(arr); */
/// printer
/* const printer=(item)=>console.log(item);
const sqr=(x)=>x*x;
const arr2=[23,23,45,4,55];
arr2.forEach(printer);
const maprslt=arr2.map(sqr);
console.log(maprslt); */
// find length of each string in arr
/* const arr=["tea","coffie",'food','lunch'];
const len=(x)=>x.length;
const lenArr=arr.map(len);
console.log(lenArr); */
//// filter
/* const arr2=[23,23,45,,2,4,55.33,22,32,342,23,4,34,23,34,5565,,343,7565,2323,343,23,23,434,435,3435,645,34,5,5,4,7,6,76,6767655,454,45,454,44545,44];
const even =arr2.filter((num)=>num%2==0);
const odd =arr2.filter((num)=>num%2!=0);
console.log(even);
console.log(odd);  */
/* const arr3=[2,3,32,4,2];
const rslt=arr3.reduce((final,item)=>final*item,1);
console.log(rslt); */
///// work.............
/* const fruit=["apple","banana","apple","orange","banana"];
const counts = fruit.reduce((item, val) => {
  item[val] = (item[val] || 0) + 1;
  return acc;
}, {});
console.log(counts);  */

//...............object..........
const obj={
/*   1:"mango",
  2:"banana",
  3:"apple" */
 fruit1:"mango",
  fruit2:"banana",
  fruit3:"apple",
  value:32
};
/* console.log(obj["2"]);
console.log(obj?.fruit4); */

//Object.freeze(obj); // freeeze the all value
Object.seal(obj);// only modification are allowed
console.log(delete obj.fruit2);
obj.value=34;
obj.fruit4="banana";
console.log(obj); 
