const paragraph=document.getElementById("test");
const heading=document.getElementById("h1-id")
console.log(paragraph.innerText); 


const buttons=document.getElementById("button-id");
buttons.addEventListener("click", function (){
buttons.innerText='please wait....';
paragraph.innerText="this is changed by dom:"
paragraph.style.color='red';
document.body.style.backgroundColor='black';
heading.style.color='green'
// buttons.disabled=true;
});