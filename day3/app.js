// console.log(name);
// var name="a";
// console.log(typeof null);

//all method and function to chech hosted
// console.log(window);

//templet literals
//  let a=10;
//  let b=12;
//  console.log(`VALUE of a is ${a} and b is ${b}`);

//object
// let arr1=[1,2,3,4,5,6,7,8];
// console.log(typeof arr1);
// console.log(arr1.push("hello"));
// console.log(arr1);
//exception
// console.log(1+"1");
// console.log(1-"1");

//function
// function printer(){
//     console.log("hello world");
// }
// printer();
// const a=function(number){
//     console.log("hello"+number);
// }
// console.log(a(19));

// diffrence bw Anonymous and arrow function
const user = {
  name: "Alice",
  
  // 1. Regular Anonymous Function
  sayHi: function() {
    setTimeout(function() {
      console.log("Regular:", this.name); 
    }, 1000);
  },

  // 2. Arrow Function
  sayBye: function() {
    setTimeout(() => {
      console.log("Arrow:", this.name);
    }, 1000);
  }
};

user.sayHi(); // Output: Regular: undefined (or "")
user.sayBye(); // Output: Arrow: Alice


//this keyword used ;
// const list={
//     item1:"sugar",
//     item2:"tea",
//     item3:{
//         inneritem:"coffie"
//     },
//     print:function(){
//         console.log(" the list of item is "+this.item1)
//     }

// };
// console.log(list.print());
// console.log(list.item3.inneritem);

