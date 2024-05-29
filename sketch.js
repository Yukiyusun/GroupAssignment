
//Here is our class for the image segments, we start with the class keyword
class DrawingBGTeam {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }

  draw() {
    this.x += random(-1, 1);
    this.y += random(-1, 1);

    this.x = constrain(this.x, 0, windowWidth);
    this.y = constrain(this.y, 0, windowHeight);

    let imgX = floor(map(this.x, 0, windowWidth, 0, img.width));
    let imgY = floor(map(this.y, 0, windowHeight, 0, img.height));
    pointsBuffer.stroke(img.get(imgX, imgY));
    pointsBuffer.strokeWeight(penSize);
    pointsBuffer.point(this.x, this.y);
  }
}

//this is a wave class, it will draw a single wave line across the screen
class Wave {
  constructor(amplitude, frequency, yBase, strokeWeight) {
    this.amplitude = amplitude; // Height of the wave
    this.frequency = frequency; // How often peaks and troughs occur
    this.yBase = yBase; // Base line of the wave
    this.offset = 0 // Initial offset for Perlin noise
    this.strokeWeight = strokeWeight; // Thickness of the wave line
  }

  // Method to display the wave
  display() {
    noFill();
    //set the colour

    //set the stroke weight (different for each class instance)
    strokeWeight(penSize);
    // Begin the shape
    beginShape();
    // xoff is the offset for Perlin noise - inside each class instance
   
    let xoff = this.offset; 
    
    //Now we move across the screen, left to right in steps of 10 pixels
    for (let x = 0; x <= windowWidth; x += 1) {
      //Every 10 pixels we sample the noise function
      let waveHeight = map(noise(xoff), 0, 1, -this.amplitude, this.amplitude);
      let imgX = floor(map(x, 0, windowWidth, 0, img.width));
      let col = img.get(imgX, floor(this.yBase));
      // Set the stroke color to the sampled color
      stroke(col);
      //We draw a vertex at the x position and the yBase position + the wave height
      point(x, this.yBase + waveHeight);
      //Increasing xoff here means the next wave point will be sampled from a different part of the noise function
      xoff += this.frequency;
    }
    //now we reached the edge of the screen we end the shape
    endShape();
    //Now we increment the class instances offset, ready for the next frame
    this.offset += 0.005; // Smaller increment for smoother animation
  }

}

// Array to store multiple waves
let waves = [];
let drawingTeam = [];
// Number of waves to create
let numWaves = 10;

//We need a variable to hold our image
let img;

//We will divide the image into segments
let numSegments = 100;

//We will store the segments in an array
let segments = [];

//lets add a variable to switch between drawing the image and the segments
let drawSegments = true;
let x;
let y;
let penSize;



//Load the image from disk
function preload() {
  img = loadImage('1.png');
}

function setup() {

  createCanvas(windowWidth, windowHeight);
  pointsBuffer = createGraphics(windowWidth, windowHeight); 
  penSize = 30;

  // Create multiple waves with varying properties
  for (let i = 0; i < numWaves; i++) {
    //We are moving down the screen as we set the yBase for each new wave
    let yBase = (i * height/2 /numWaves+height/2)+100;
    //As we move down the screen i gets bigger and so does the amplitude
    let amplitude = 20 + i * 10; 
    //As we move down the screen the waves get heavier by increasing the stroke weight
    let strokeW = 5+i; 
    waves.push(new Wave(amplitude, random(0.01, 0.02), yBase, strokeW));
  }

  
  drawingTeam.push(new DrawingBGTeam(20,20));
  drawingTeam.push(new DrawingBGTeam(20,windowHeight));
  drawingTeam.push(new DrawingBGTeam(windowWidth,20));
  drawingTeam.push(new DrawingBGTeam(windowWidth,windowHeight));

  
}

function draw() {
  background(0);
  //display the original image
  if (!drawSegments) {
    image(img, 0, 0, windowWidth, windowHeight);
  }
  

  // Draw the points from the buffer onto the main canvas
  image(pointsBuffer, 0, 0,windowWidth, windowHeight);

  
  //draw the image
  push();
  for (let i = 0; i < 1000; i++) {
    for (let i = 0; i < drawingTeam.length; i++) {
      drawingTeam[i].draw();
    }
  }
  pop();

 
  // draw wave
  push();
  for (let i = 0; i < waves.length; i++) {
    waves[i].display();
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pointsBuffer.resizeCanvas(windowWidth, windowHeight);
  penSize = windowHeight/30;

  //redraw the waves
  waves = [];
  for (let i = 0; i < numWaves; i++) {
    let yBase = (i * height / 2 / numWaves + height / 2) + 100;
    let amplitude = 20 + i * 10;
    let strokeW = 5 + i;
    waves.push(new Wave(amplitude, random(0.01, 0.02), yBase, strokeW));
  }
}



function keyPressed() {
  if (key == " ") {
    drawSegments = !drawSegments;
  }
} 