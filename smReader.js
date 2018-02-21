//Proprietary script to convert Stepmania SM files to JSON objects usable in faerie.FM

//Format for the Output Data
var obj = {
  greenDust:{
    bpm: BPM,
    name: 'greenDust',
    quantity: 25,
    animated: true,
    frames: 3,
    x:[],
    y:[],
    ix:[],
    iy:[]
  },
  wall: {
    name: 'wall',
    quantity: 15,
    animated: false,
    frames: undefined,
    x: [],
    y: [],
    ix: [],
    iy: []
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
        
        //calculate x position
        var ix = [];
        var pushCount = 1;
        switch(beginnerBox[i][j]){
          case '10000000':
            console.log("note1 found");
            ix.push(50);
            break;
          case '01000000':
            ix.push(150);
            break;
          case '00100000':
            ix.push(250);
            break;
          case '00010000':
            ix.push(350);
            break;
          case '00001000':
            ix.push(450);
            break;
          case '00000100':
            ix.push(550);
            break;
          case '00000010':
            ix.push(650);
            break;
          case '11000000':
            ix.push(50,150);
            pushCount=2;
            break; 
          case '11100000':
            ix.push(50,150,250);
            pushCount=3;
            break;
          case '11110000':
            ix.push(50,150,250,350);
            pushCount=4;
            break;
          case '11111000':
            ix.push(50,150,250,350,450);
            pushCount=5;
            break;
          case '11111100':
            ix.push(50,150,250,350,450,550);
            pushCount=6;
            break;
          case '11111110':
            ix.push(50,150,250,350,450,550,650);
            pushCount=7;
            break;
        } 

        for(k=0; k<ix.length; k++){
          console.log("xpushed");
          obj['greenDust']['ix'].push(ix[k]);
        }

        for(l=0; l<pushCount; l++){
          console.log('ypushed');
          obj['greenDust']['iy'].push(noteTime);
        }

      }
        else if(beginnerBox[i][j].indexOf("M")>=0){
        //calculate y time of the Wall obstacle
        noteTime = (linePos-1)*(measureLength/lineTotal)+(measureNum*measureLength);
        obj['wall']['iy'].push(noteTime);
        
        //calculate x position of the wall obstacle
        var ix
        switch(beginnerBox[i][j]){
          case 'M0000000':
            ix = 50;
            break;
          case '0M000000':
            ix = 150;
            break;
          case '00M00000':
            ix = 250;
            break;
          case '000M0000':
            ix = 350;
            break;
          case '0000M000':
            ix = 450;
            break;
          case '00000M00':
            ix = 550;
            break;
          case '000000M0':
            ix = 650;
            break;
        } 
        obj['wall']['ix'].push(ix);
    }
  }
}
}
obj['greenDust']['bpm'] = BPM;
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

 
