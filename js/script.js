let params = {
  GravityConstant: 0.5,
  BgAlpha: 30,
  StarRadius: 0.5,
  StarAlpha: 0.5,
  FrameRate: 120
}
const gui = new dat.GUI();
gui.add (params, 'GravityConstant', 0.5, 1).step(0.01);
gui.add(params, 'StarRadius', 0.1, 1);
gui.add(params, 'StarAlpha', 0.01, 1.0);
gui.add(params, 'BgAlpha', 0, 255).step(1);
gui.add(params, 'FrameRate').listen();

let starSystems = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background (0);
  starSystems.push(new StarSystem(int(random(1, 4)), width/2, height/2, random(5, 15)));
  starSystems.push(new StarSystem(int(random(1, 4)),random(width/5, width/2), random(height/5, height/2), random(5, 15)));
  starSystems.push(new StarSystem(int(random(1, 4)), random(width/2, width*(4/5)), random(height/2, height *(4/5)), random(5, 15)));
}
function draw(){
  background (0, params.BgAlpha);
  fps = frameRate();
  params.FrameRate = fps;
  for (let i=0; i<starSystems.length; i++) {
    let system = starSystems[i];
    system.run();
}
}
class Core {
  constructor (x, y, m){
    this.pos = createVector(x,y);
    this.vel = createVector(0,0);
    this.acc = createVector(0,0);
    this.mass = m;
    this.rad = 1;
  }
  applyForce(f){
    let force = f.copy();
    force.div(this.mass);
    this.acc.add(force)
  }
  applyAttraction(other){
    let distance = this.pos.dist(other.pos);
    let magnitude = (params.GravityConstant * this.mass * other.mass)/(distance*distance);
    let force = p5.Vector.sub(other.pos, this.pos);
    force.normalize();
    force.mult(magnitude);
    this.applyForce(force);
  }

  update(){
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(0);
  }
  display(){
    push();
    translate(this.pos.x, this.pos.y);
    noStroke();
    fill(0);
    ellipse(0,0, this.rad*2, this.rad*2);
    pop()
  }
}
class Particle {
  constructor(x, y, m){
    this.pos = createVector(x, y);
    this.vel = createVector(0,0);
    this.acc = createVector(0,0);
    this.mass = m;
    this.rad = .25;
    this.isDone = false;
  }
  setVelocityWAngle( other, angle, magnitude ) {
    //Manupulate initial velocity
    let force = p5.Vector.sub(other.pos, this.pos);
    force.normalize(); // only get the direction
    force.rotate( angle ); // radians
    force.mult( magnitude );
    this.vel = force.copy();
  }

  applyForce(f){
    let force = f.copy();
    force.div(this.mass);
    this.acc.add(force)
  }
  checkDistanceTo( other ) {
    let distance = this.pos.dist(other.pos);
    if ((distance*(0.1)) < other.rad) {
      this.isDone = true;
    }
  }
  applyAttraction(other){
    let distance = this.pos.dist(other.pos);
    let magnitude = (params.GravityConstant * this.mass * other.mass)/(distance*distance);
    let force = p5.Vector.sub(other.pos, this.pos);
    if (distance < other.rad) {
      //force.mult(-magnitude*1.5); // repel
    } else {
      force.mult(magnitude); // attract
    }
    this.applyForce(force);
  }

  update(){
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.limit(10)
  }
  display(){
    push();
    translate(this.pos.x, this.pos.y);
    noStroke();
    ellipse(0,0, 2* params.StarRadius, 2* params.StarRadius);
    pop()
  }
}
class StarSystem {
  constructor(mode, x, y, m){
    this.pos = createVector(x,y);
    this.hue = random(360);
    this.sat = random(100);
    this.bri = 100;
    this.blackHole = new Core (0, 0, m);
    this.stars = [];
    this.starCount = 1000;
    if (mode == 1){
      this.createStars1();
    }
    else if (mode == 2) {
      this. createStars2();
    }
    else if (mode == 3) {
      this.createStars3();
    }
  }
  run(){
    push();
    translate(this.pos.x, this.pos.y);
    this.blackHole.update();
    this.blackHole.display();
    colorMode(HSB);
    fill(this.hue, this.sat, this.bri, params.StarAlpha);
    for(let i = 0; i< this.stars.length; i++){
      let s = this.stars[i];
      s.applyAttraction(this.blackHole);
      s.update();
      s.checkDistanceTo(this.blackHole);
      s.display();
    }
    for (let i=this.stars.length-1; i>=0; i--) {
      let s = this.stars[i];
      if (s.isDone) {
        //this.blackHole.mass += (s.mass)*0.1;
        this.stars.splice(i, 1);
      }
    }
    pop();
  }
  createStars1(){
    this.stars = [];
    for (let i = 0; i<this.starCount; i++){
      let angle = random (TWO_PI);
      let distance;
      if (width/2 < height/2){
        distance = random (width/2)
      }
      else {
        distance = random (height/2)
      }
      let x = cos(angle) * distance;
      let y = sin(angle) * distance;
      let s;
      s = new Particle (x, y, 50);
      s.setVelocityWAngle(this.blackHole, radians(90), 1.5);
      this.stars.push(s);
    }
  }
  createStars2(){
    this.stars = [];
    for (let i = 0; i<this.starCount; i++){
      let angle = random (TWO_PI);
      let distance;
      if (width/2 < height/2){
        distance = random (width/2)
      }
      else {
        distance = random (height/2)
      }
      if (random(1) < 0.5){
        angle = random(PI*0.25, PI*0.75);
      }
      else{
        angle = random(PI*1.25, PI*1.75);
      }
      let x = cos(angle) * distance;
      let y = sin(angle) * distance;
      let s;
      s = new Particle (x, y, 50);
      s.setVelocityWAngle(this.blackHole, radians(90), 1.5);
      this.stars.push(s);
    }
  }
  createStars3(){
    this.stars = [];
    for (let i = 0; i<this.starCount; i++){
      let angle = random (TWO_PI);
      let distance;
      if (width/2 < height/2){
        distance = random (width/2)
      }
      else {
        distance = random (height/2);
      }
      if (random(2) < 0.5){
        angle = random(PI*(1/3),PI*(2/3));
      }
      else if(0.5 < random(2) < 1){
        angle = random(PI,PI*(4/3));
      }
      else if(1 < random(2) < 1.5){
        angle = random(PI*(5/3),PI*(2));
      }
      let x = cos(angle) * distance;
      let y = sin(angle) * distance;
      let s;
      s = new Particle (x, y, 50);
      s.setVelocityWAngle(this.blackHole, radians(90), 1.5);
      this.stars.push(s);
    }
  }
}
/* notes:

ctrl + / : toggle comment
ctrl + shift + i : auto-formatting (auto-indent)

Arrays
numbers = [ 1, 2, 3, 4 ];

let num = numbers[0]; // num = 1;
numbers[0] = 50;
let total = numbers.length; // total = 5;

for (let i=0; i<numbers.length; i++) {
numbers[i];
}

RGB Color Model
(w)
(w, a)
(r, g, b)
(r, g, b, a)

HSB Color Model
(H, S, B)
(H, S, B, A)
Hue(Color Wheel, 0 - 360 degrees), Saturation, Brightness

https://p5js.org/reference/#/p5/colorMode
If I want to call it
colorMode(HSB)
fill(parameters for GUI)
*/
