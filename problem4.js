//using json file to read and write it to an array

const fs = require("fs");

//reading the json file, so the output will be string
const data = fs.readFileSync("inventory-report.json", "utf8");

//we will convert the string to array so that we can loop through it, because if we loop through string we get characters not objects
const obj = JSON.parse(data);

//we will create the output.txt file that is empty
const outputFile = "output.txt";
fs.writeFileSync("output.txt", "");

//looping through the data to append
for (let i = 0; i < obj.length; i++) {

  //Convert object to JSON string to write to file
  const item = JSON.stringify(obj[i]);

  // Write string to file like each item
  fs.appendFileSync(outputFile, `${item}\n`);
}

console.log("File written successfully!");

//Read and display final output
const finalOutput = fs.readFileSync(outputFile, "utf8");
const lines = finalOutput.trim().split('\n');

const arr = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i]) { // avoid empty lines
    arr.push(JSON.parse(lines[i]));
  }
}
console.log(arr);