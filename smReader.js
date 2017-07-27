//Proprietary script to convert Stepmania SM files to JSON objects usable in faerie.FM

//globals
var fs = require('fs');
var filePath = process.argv[2];
var path = require('path');
var fileName = path.basename(filePath, '.sm');
var noteSection = false;
var doubleSection = false;
var beginnerSong = false;
var beginnerNotes = [];
var mediumNotes = [];
var beginnerBox=[];
var fileData, splitData, BPM, linePos, lineTotal, measureNum, measureLength, noteTime;
 


//First take in Data from the command line
fileData = fs.readFileSync(filePath, 'utf8');


//Process the data
splitData = fileData.split(" ");
console.log(splitData);

var arrayLength = splitData.length;

for(var i=0; i<arrayLength; i++){
  if(splitData[i]== '----------------\r\n#NOTES:\r\n'){
    console.log("Notes section found...");
    noteSection = true;   
  }
  else if(splitData[i]=='dance-double:\r\n' && noteSection==true){
    console.log("Doubles section found...");
    doubleSection = true;
  }
  else if(splitData[i]=='Beginner:\r\n' && doubleSection==true){
    beginnerSong = true;
    mediumSong = false;  
  }
  else if(splitData[i]=='Medium:\r\n'){
    mediumSong = true;
    beginnerSong = false;
  }
  else if(splitData[i]=='measure' && noteSection==true && doubleSection==true)  {
    var j = i+1;
    if(beginnerSong==true){
      beginnerNotes.push(splitData[j]);
    }
    else if(mediumSong==true){
      mediumNotes.push(splitData[j]);
    }
  }
  else if(splitData[i]=='dance-single:\r\n'){
    noteSection = false;
    doubleSection = false;
    beginnerSong = false;
    mediumSong = false;
  }
}

console.log(beginnerNotes);

function splitNotes(){

  for(var i=0; i<beginnerNotes.length; i++){
    var currentString = beginnerNotes[i];
    var beginnerSplit = currentString.split("\r\n");
    beginnerBox.push(beginnerSplit);
  }
 
  console.log(beginnerBox);
}

splitNotes();


//Convert Data to actual times here

//BPM, measureLength, linePos, lineTotal, measureNum



function getMeasureLength(){
  
}

measureLength = (60/BPM)*4;
noteTime = (linePos-1)*(measureLength/lineTotal)+(measureNum*measureLength);


//Error Messages go here
if(noteSection=false){
  console.log("Notes section not found!");
}

//Write then data to a new file

//format for the data
var obj = {
  greenDust:{
    name: 'greenDust',
    quantity: quantity,
    animated: false,
    frames: undefined,
    x:[],
    y:[],
    ix:[],
    iy:[]
  }
}

var JSONobj = JSON.stringify(obj);

var inData = fileName + " = " + JSONobj;

