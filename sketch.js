//Here is our class for the image segments, we start with the class keyword
class DrawingBGTeam {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }

  draw() {
    this.x += random(-2, 2);
    this.y += random(-2, 2);

    this.x = constrain(this.x, 0, windowWidth);
    this.y = constrain(this.y, 0, windowHeight);

    let imgX = floor(map(this.x, 0, windowWidth, 0, img.width));
    let imgY = floor(map(this.y, 0, windowHeight, 0, img.height));
    // Get the colour of the sky image at that position
    let skyImgCol = skyImg.get(imgX, imgY);
    if (brightness(skyImgCol) > 0) {
     // Determine if there is any colour information in the sky image at this location. If there is, set the colour of the brush to a gradient.
      pointsBuffer.stroke(skyPenCol);
      pointsBuffer.strokeWeight(penSize);
      pointsBuffer.point(this.x, this.y);
    } else {
      // otherwise make the colour follow the colour of the corresponding position in the image.
      pointsBuffer.stroke(img.get(imgX, imgY));
      pointsBuffer.strokeWeight(penSize);
      pointsBuffer.point(this.x, this.y);
    }
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

// This particle class, which will draw the fluorescent flow field of the building.
class Particle {
  constructor() {
    // Randomly set particle coordinates and other parameters
    this.x = random(width / 2);
    this.y = random(height);
    this.life = random(100);
    this.noiseSeed = random(100);
  }
  display() {
    let imgX = floor(map(this.x, 0, windowWidth, 0, img.width));
    let imgY = floor(map(this.y, 0, windowHeight, 0, img.height));
    // Get the colour of the building image at that position based on the particle position.
    let buildImgCol = buildImg.get(imgX, imgY);
    if (brightness(buildImgCol) > 0) {
      // Determine if there is any colour information in the building image at this location.
      if (!this.col || random(100) < 1) {
        // Get the colours from the image as particle colours
        this.col = buildImgCol
        // Reduce the transparency of the colour
        this.col=color(red(this.col),green(this.col),blue(this.col),90)
      }
      // Set the blend mode to ADD to make the particles fluorescent.
      flowfield.blendMode(ADD);
      flowfield.strokeWeight(4);
      flowfield.stroke(245, 100);
      flowfield.stroke(this.col);
      // Drawing particles
      flowfield.point(this.x, this.y);
      // Recovery Mix Mode
      
      flowfield.blendMode(BLEND);
    }
  }
  update() {
    // Calculate the angle of particle motion with the noise function
    let theta =
      noise(
        this.x * 0.005,
        this.y * 0.005,
        frameCount * 0.02 + this.noiseSeed
      ) * 360;
    // Calculate the speed of motion from angles using trigonometry
    let xSpd = cos(radians(theta)) * 2;
    let ySpd = sin(radians(theta)) * 2;
    // Particles move according to velocity
    this.x += xSpd;
    this.y += ySpd;
    this.life -= 1;
    if (this.life <= 0) {
      // Refresh the position of the particle when life is less than 0.
      this.life = 100;
      this.x = random(width / 2);
      this.y = random(height);
    }
  }

}

// Array to store multiple waves
let waves = [];
let drawingTeam = [];
// Number of waves to create
let numWaves = 10;
// Array to store particle

let particle = [];

//We need variable to hold our image
let img;
let skyImg;
let buildImg;

//We will divide the image into segments
let numSegments = 100;

//We will store the segments in an array
let segments = [];

//lets add a variable to switch between drawing the image and the segments
let drawSegments = true;
let x;
let y;
let penSize;

// Parameters controlling colour transition changes
let colAmt = 0;
let skyPenCol;
// Two colours for the gradient
let col1, col2;

//Load the image from disk
function preload() {
  img = loadImage('1.png');
  skyImg = loadImage("sky.jpg");
  buildImg = loadImage("building.jpg");
}

function setup() {

  createCanvas(windowWidth, windowHeight);
  pointsBuffer = createGraphics(windowWidth, windowHeight);
  // Separate layer for drawing building particles
  flowfield = createGraphics(windowWidth, windowHeight); 
  penSize = 30;

  // Set the two gradient colours 
  col1 = color("#3f5184");
  col2 = color("#d0a85c");

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
  drawingTeam.push(new DrawingBGTeam(width / 2, height / 2));
  drawingTeam.push(new DrawingBGTeam(windowWidth,windowHeight));
  for (let i = 0; i < 1800; i++) {
    particle.push(new Particle());
  }
  
}

function draw() {
  background(0);
  // Use the sin function to set colAmt so that it changes periodically, allowing the colours to repeat back and forth as a gradient.
  colAmt = map(sin(frameCount * 0.02), -1, 1, 0, 1);
  // Get the gradient colour from col1 to col2.
  skyPenCol = lerpColor(col1, col2, colAmt);
  //display the original image
  if (!drawSegments) {
    image(img, 0, 0, windowWidth, windowHeight);
  }

  // Draw the points from the buffer onto the main canvas
  image(pointsBuffer, 0, 0, windowWidth, windowHeight);
  // Draw the building particle screen to the canvas
  image(flowfield, 0, 0, windowWidth, windowHeight);

  //draw the image
  push();
  for (let i = 0; i < 1000; i++) {
    for (let i = 0; i < drawingTeam.length; i++) {
      drawingTeam[i].draw();
    }
  }
  pop();
  // Draw the contents of the building on the flowfield layer.
  // and is semi-transparent, the particles will have a trailing effect.
  flowfield.tint(255, 10);
  flowfield.image(buildImg, 0, 0, windowWidth, windowHeight);
  // Drawing particles
  for (let i = 0; i < particle.length; i++) {
    particle[i].update();
    particle[i].display();
  }
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