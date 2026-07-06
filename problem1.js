//problem 
const users = [
  { id: 1, name: "John", age: 22, active: true },
  { id: 2, name: "Sara", age: 17, active: false },
  { id: 3, name: "Mike", age: 35, active: true },
  { id: 4, name: "Emma", age: 28, active: false },
  { id: 5, name: "David", age: 42, active: true }
];
//count the active users
/*let count = 0;
for(let key in users){
    if(users[key].active === true){
        count++;
    }
}
console.log(count);*/
//alternative using method filter
let active = users.filter((user) => {
    user.active}).length;
console.log(active);


//count of inctive users
/*let counts = 0;
for(let key in users){
    if(users[key].active === false){
        counts++;
    }
}
console.log(counts);*/
//alternative using method filter
let inactive = users.filter((user) => {
    !user.active}).length;
console.log(inactive);

//average age
/*let total = Object.keys(users).length;
//console.log(total);
let sum = 0;
for(let i in users){
    sum = sum + users[i].age;
}
let average = sum/total;
console.log(average);*/
//alternative method using reduce
let average = users.reduce((sum, user) =>{
    return sum + user.age;
}, 0)/users.length;
console.log(average);

//find the oldest user
/*let oldest = users[0].age;
for(let i = 1; i < users.length; i++){
    if(oldest < users[i].age){
        oldest = users[i].age;
    }
}
console.log(oldest);*/
//altervative method
let oldest = users.reduce((max, user) => {
    return user.age > max.age ? user : max
});
console.log(oldest);

//find the youngest user
/*let youngest = users[0].age;
for(let i = 1; i < users.length; i++){
    if(youngest > users[i].age){
        youngest = users[i].age;
    }
}
console.log(youngest);*/
//alternative method
let youngest = users.reduce((min, user) => {
    return user.age < min.age ? user : min
});
console.log(youngest);

//return only active user
let activeUsers = users.filter((user) => {
    user.active});
console.log(activeUsers);

//return inactive users
let inactiveUsers = users.filter((user) =>{
     !user.active});
console.log(inactiveUsers);

//sort in descending
let descending = users.sort((a,b) => b.age-a.age);
console.log(descending);
