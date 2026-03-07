function greet(callback){
    let name = prompt("Enter name");

    let message = (n) => `Hello ${n}, Welcome!`;

    callback(message(name));
}

function display(msg){
    alert(msg);
}

greet(display);