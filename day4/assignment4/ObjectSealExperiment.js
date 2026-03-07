let user = {
    name:"Amit",
    age:22
};

Object.seal(user);

user.age = 25;
user.city = "Delhi";
delete user.name;

console.log(user);