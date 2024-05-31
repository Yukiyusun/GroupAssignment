
//class for drawing the drawing
class DrawingBGTeam {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }

  drawSky() {
    this.x += random(-2, 2);
    this.y += random(-2, 2);
  
    this.x = constrain(this.x, 0, windowWidth);
    this.y = constrain(this.y, 0, windowHeight);
  
    let skyImgCol = color(img.get(this.x, this.y));
  
    // Interpolate the sky color if transitioning
    if (isTransitioning) {
      transitionProgress += 0.000001; // Adjust the speed of transition
      transitionProgress = constrain(transitionProgress, 0,0.5); // Clamp between 0 and 1
      let targetColor = lerpColor(color(0,0,0), color(0,0,139), colAmt);
      let currentColor = lerpColor(skyImgCol, targetColor, transitionProgress);
      pointsBuffer.stroke(currentColor);
      
    }
    pointsBuffer.strokeWeight(penSize);
    pointsBuffer.point(this.x, this.y);
  }
  
  
  drawOriginal() {
    this.x += random(-2, 2);
    this.y += random(-2, 2);

    this.x = constrain(this.x, 0, windowWidth);
    this.y = constrain(this.y, 0, windowHeight);

    let imgX = floor(map(this.x, 0, windowWidth, 0, img.width));
    let imgY = floor(map(this.y, 0, windowHeight, 0, img.height));

    // Update the coverage array
    let pixelX = floor(this.x / 2) * 2; // Ensure even number
    let pixelY = floor(this.y / 2) * 2; // Ensure even number
    // Ensure pixelX and pixelY are within bounds

    if (pixelX >= 0 && pixelX < windowWidth && pixelY >= 0 && pixelY < windowHeight) {
      if (!coverage[pixelX][pixelY]) {
        coverage[pixelX][pixelY] = true;
        coveredPixels++;
        pointsBuffer.stroke(img.get(imgX, imgY));
        pointsBuffer.strokeWeight(penSize);
        pointsBuffer.point(this.x, this.y);
      }
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


      if (isTransitioning) {
        transitionProgress += 0.000001; // Adjust the speed of transition
        transitionProgress = constrain(transitionProgress, 0, 0.5); // Clamp between 0 and 1
        let col = img.get(imgX, floor(this.yBase));
        let targetColor = lerpColor(color(0,0,0), color(0,0,139), colAmt);
        let currentColor = lerpColor(color(col), targetColor, transitionProgress);
        let waveColor = color(red(currentColor), green(currentColor), blue(currentColor), 15);
        stroke(waveColor);
      } else {
        let col = img.get(imgX, floor(this.yBase));
        let waveColor = color(red(col), green(col), blue(col), 15);
        stroke(waveColor);
      }
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
let skyImg;
let transitionProgress = 0;
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

// Array to track coverage of the screen
let coverage;
let totalPixels;
let coveredPixels;
let pointsBuffer;
let isTransitioning;
//Load the image from disk
function preload() {
  img = loadImage('1.png');
  skyImg = loadImage("sky.jpg");
}

function setup() {

  createCanvas(windowWidth, windowHeight);
  pointsBuffer = createGraphics(windowWidth, windowHeight); 
  penSize = 30;


  // Set the two gradient colours 
  col1 = color("#00FF00");
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

  // Initialize the coverage array
  coverage = [];
  for (let i = 0; i < windowWidth; i += 2) {
    coverage[i] = [];
    for (let j = 0; j < windowHeight; j += 2) {
      coverage[i][j] = false;
    }
  }

  totalPixels = floor((windowWidth / 2) * (windowHeight / 2));
  coveredPixels = 0;
  
}

function draw() {
  background(0);
  // Use the sin function to set colAmt so that it changes periodically, allowing the colours to repeat back and forth as a gradient.
  colAmt = map(sin(frameCount * 0.02), -1, 1, 0, 1);

  //display the original image
  if (!drawSegments) {
    image(img, 0, 0, windowWidth, windowHeight);
  }

  // Draw the points from the buffer onto the main canvas
  image(pointsBuffer, 0, 0, windowWidth, windowHeight);

  //draw the image
  push();
  for (let i = 0; i < 5000; i++) {
    if (allCovered()) {
      break;
    }
    for (let i = 0; i < drawingTeam.length; i++) {
      drawingTeam[i].drawOriginal();
    }
  }
  for (let i = 0; i < 5000; i++) {
    for (let i = 0; i < drawingTeam.length; i++) {
      if (allCovered()) {
        drawingTeam[i].drawSky();
      }
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

  // Initialize the coverage array
  coverage = [];
  for (let i = 0; i < windowWidth; i += 2) {
    coverage[i] = [];
    for (let j = 0; j < windowHeight; j += 2) {
      coverage[i][j] = false;
    }
  }

  totalPixels = floor((windowWidth / 2) * (windowHeight / 2));
  coveredPixels = 0;
  




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

// Function to check if all pixels are covered
function allCovered() {
  if (coveredPixels === totalPixels) {
    isTransitioning = true; // Start the transition
  }
  return coveredPixels === totalPixels;
}
