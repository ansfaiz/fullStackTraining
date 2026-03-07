let company = {
    department:{
        manager:{
            name:"Mr Sharma"
        }
    }
};

console.log(company.department?.manager?.name);
console.log(company.department?.ceo?.name);