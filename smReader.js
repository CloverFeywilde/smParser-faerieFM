//Proprietary script to convert Stepmania SM files to JSON files usable in faerie.FM

//globals
var fs = require('fs');
var filePath = process.argv[2];
var fileData, splitData 


//First take in Data from the command line
fileData = fs.readFileSync(filePath, 'utf8');


//Process the data
splitData = fileData.split(" ");
console.log(splitData);


//Write then data to a new file
