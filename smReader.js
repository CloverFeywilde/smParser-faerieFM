//Proprietary script to convert Stepmania SM files to JSON objects usable in faerie.FM

//Format for the Output Data
var obj = {
  bpm: 0,
  greenDust:{
    name: 'greenDust',
    quantity: 25,
    animated: true,
    frames: 3,
    x:[],
    y:[],
    ix:[],
    iy:[]
  }
}




//globals
var fs = require('fs');
var filePath = process.argv[2];
var path = require('path');
var fileName = path.basename(filePath, '.sm');
var outFile = path.join("levels" + '.json');
var noteSection = false;
var doubleSection = false;
var beginnerSong = false;
var beginnerNotes = [];
var mediumNotes = [];
var beginnerBox=[];
var titleBox=[];
var linePos = 0;
var fileData, splitData, BPM, lineTotal, measureNum, measureLength, noteTime;
 


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
  
  else if(i==1){
    var titleData = splitData[i];
    titleBox = titleData.split("\r\n");
    for(var k=0; k<titleBox.length; k++){
      var bpmBox = titleBox[k];
      if(bpmBox.indexOf("BPMS") >= 0){
        var bpmBoxSplit = bpmBox.split("=");
        BPM = parseInt(bpmBoxSplit[1]);
        console.log("BPM found: " + BPM);
      }
    }
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


//Error Messages go here
if(noteSection=false){
  console.log("Notes section not found!");
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
  measureLength = (60/BPM)*4;
}
getMeasureLength();

function getNoteTime(){
  for(i=0; i<beginnerBox.length; i++){
    linePos = 0;
    for(j=1; j<=beginnerBox[i].length-2; j++){
      linePos++; 
      lineTotal = beginnerBox[i].length-2;
      measureNum = parseInt(beginnerBox[i][0]);
      if(beginnerBox[i][j].indexOf("1")>=0){
        //calculate y time
        noteTime = (linePos-1)*(measureLength/lineTotal)+(measureNum*measureLength);
        obj['greenDust']['iy'].push(noteTime);
        
        //calculate x position
        var ix
        switch(beginnerBox[i][j]){
          case '10000000':
            ix = 50;
            break;
          case '01000000':
            ix = 150;
            break;
          case '00100000':
            ix = 250;
            break;
          case '00010000':
            ix = 350;
            break;
          case '00001000':
            ix = 450;
            break;
          case '00000100':
            ix = 550;
            break;
          case '00000010':
            ix = 650;
            break;
        } 
        obj['greenDust']['ix'].push(ix);
      }
    }
  }
}
obj['bpm'] = BPM;
getNoteTime();
console.log(obj);


//Error Messages go here
if(noteSection=false){
  console.log("Notes section not found!");
}

//Write then data to a new file

var JSONobj = JSON.stringify(obj);

var inData = "\r\n" + "var " + fileName + " = " + "'" + JSONobj + "'";

fs.appendFileSync(outFile, inData, 'utf-8');

 
