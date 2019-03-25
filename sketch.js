let line = [];

let currentLine;

let noteNames = ["C2", "D2", "E2", "F2", "G2", "A2", "B2"];
let melodyPlayer = new Tone.Sampler(
	{
		"A1": "samples/casio/A1.mp3",
		"B1" : "samples/casio/B1.mp3",
		"C2": "samples/casio/C2.mp3",
		"D2" : "samples/casio/D2.mp3",
		"E2": "samples/casio/E2.mp3",
		"F2" : "samples/casio/F2.mp3",
		"G2": "samples/casio/G2.mp3",
		"A2" : "samples/casio/A2.mp3"
	});
melodyPlayer.toMaster();
let currentNotes = [];
let savedNotes = [];

let cnv;
let playLast, saveLast, savedList;

function setup() {
	cnv = createCanvas(windowWidth, windowHeight - 96);
	cnv.parent('canvasContainer');
	background(220);
	currentLine = -1;

	playLast = select('#play-last');
	playLast.mousePressed(playLastStroke);
	saveLast = select('#save-last');
	saveLast.mousePressed(saveLastStroke);
	savedList = document.getElementById("select-saved");
	playSelect = select('#play-selected');
	playSelect.mousePressed(playSelected);
	clear = select('#clear-canvas');
	clear.mousePressed(clearCanvas);
}

function draw() {
	background(220);
	if (mouseIsPressed && mouseY <= height) {
		let newDot = new dot(mouseX, mouseY);
		line[currentLine].push(newDot);
	}

	for (let lines = 0; lines < line.length; lines++){
		for (let dots = 0; dots < line[lines].length; dots++){
			line[lines][dots].update();
			line[lines][dots].display();
		}
	}
}

function mousePressed(){
	// check audio context
	if (Tone.context.state !== 'running') {
        Tone.context.resume();
  }

	// save last set of dots
	currentLine ++;
	let newSetOfDots = [];
	line.push(newSetOfDots);
}

function mouseReleased(){
	// does not trigger when using controls
	if(mouseY > height){return;}

	// initialize arrays
	let notes = [];
	let timeline = [];
	for (let i = 0; i < 8; i++){
		timeline[i] = [];
	}

	// collect dots in each time interval
	for (let dots = 0; dots < line[currentLine].length; dots++){
		let dotXY = line[currentLine][dots].getCoord();
		let dotTime = constrain(floor(map(dotXY.x, 0, width, 0, 8)), 0, 7);
		let dotY = dotXY.y;
		timeline[dotTime].push(dotY);
	}

	// average each set of dots to get one value
	for (let i = 0; i < 8; i++){
		let sum = 0;
		for (let dots = 0; dots < timeline[i].length; dots++){
			let currentDotY = timeline[i][dots];
			sum = sum + currentDotY;
		}
		let avg = floor(sum / timeline[i].length);
		notes.push(avg);
	}

	// convert values into notes and play
	currentNotes = [];
	for (let i = 0; i < 8; i++){
		currentNotes.push(noteNames[floor(map(notes[i], 0, height, 7, 0))]);
	}
	Tone.Transport.start();
	let currentSequencer = new Tone.Sequence(function(time, note){
		//console.log(note);
		melodyPlayer.triggerAttack(note);
	}, currentNotes, "8n");
	currentSequencer.loop = 0;
	currentSequencer.start();
}

function playLastStroke(){
	Tone.Transport.start();
	let currentSequencer = new Tone.Sequence(function(time, note){
		//console.log(note);
		melodyPlayer.triggerAttack(note);
	}, currentNotes, "8n");
	currentSequencer.loop = 0;
	currentSequencer.start();
}

function saveLastStroke(){
	// fetch input and save
	let currentSet = {
		name: document.getElementById('melody-name').value,
		notes: currentNotes
	}
	savedNotes.push(currentSet);
	document.getElementById('melody-name').value = "";
	let option = document.createElement("option");
	option.text = currentSet.name;
	savedList.add(option);
}

function playSelected(){
	let selection = document.getElementById('select-saved');
	let currentSelection = selection[selection.selectedIndex].value;
	console.log(currentSelection);

	function findSelected(set) {
		return set.name === currentSelection;
	}

	let setFound = savedNotes.find(findSelected).notes;
	console.log(setFound);

	Tone.Transport.start();
	let currentSequencer = new Tone.Sequence(function(time, note){
		melodyPlayer.triggerAttack(note);
	}, setFound, "8n");
	currentSequencer.loop = 0;
	currentSequencer.start();
}

function clearCanvas(){
	line = [];
	currentLine = -1;
}

class dot {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.life = 180;
		this.size = 1;
	}

	display(){
		push();
		let currentOpacity = map(this.life, 180, 0, 1, 0.1);
		let c = color('rgba(0, 0, 0, '+currentOpacity+')');
		stroke(c);
		fill(c);
		ellipse(this.x, this.y, this.size);
		pop();
	}

	update(){
		this.life--;
		this.life = constrain(this.life, 0, 180);
		this.size = map(this.life, 100, 0, 1, 3.5);
	}

	getCoord(){
		let dotCoord = {
			x: this.x,
			y: this.y
		}
		return dotCoord;
	}
}
