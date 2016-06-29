
//Sets the webcam feed
var video;

var reverb;


//Sets our tracking object
var tracker;

var slider;

var delay, delay2;
var filtera;
var attackLevel = 0.6;
var releaseLevel = 0;

var attackTime = 0.1;
var decayTime = 0.1;
var susPercent = 0.2;
var releaseTime = 0.01;




//Set the color to track, the video is clicked.
var rhi, ghi, bhi;
var rlo, glo, blo;
function setTarget(r, g, b, range) {
  range = range || 20;
  rhi = r + range, rlo = r - range;
  ghi = g + range, glo = g - range;
  bhi = b + range, blo = b - range;
}


function setup() {
  var w = 640, h = 360;
  cnv = createCanvas(w, h);
  cnv.parent('container');
  
  reverb = new p5.Reverb();


  // slider = createSlider(0,10000,500,200);
  // slider.position(40, 600);

  video = createVideo(['assets/cloudchamberContrast.mov']);

  video.size(w, h);
  video.parent('container');
 // video.hide();
  video.loop();
  
  filtera = new p5.LowPass();
  filtera.set(15000,10);

  
  delay = new p5.Delay();
  delay2 = new p5.Delay();
  
  masterVolume(0.3);

  
  env = new p5.Env();
  env.setADSR(attackTime, decayTime, susPercent, releaseTime);
  env.setRange(attackLevel, releaseLevel);
  
  osc1 = new p5.TriOsc()
  // osc.setType('saw');
  osc1.freq(240);
  osc1.amp(env);

  osc1.disconnect();
  osc1.connect(filtera);
  osc1.start();
  
  osc2 = new p5.SinOsc()
  // osc.setType('saw');
  osc2.freq(240);
  osc2.amp(env);

  osc2.disconnect();
 // osc2.connect(filtera);
  osc2.start();
  
  delay.setType('pingPong');
  delay.process(osc1, .5, .5, 1300);
 // delay2.setType('pingPong');
//  delay2.process(osc2, .9, .5, 300);
  
  filtera.disconnect();
  reverb.process(filtera,5,1);


  
  // capture.hide(); // tracking.js can't track the video when it's hidden
  
  setTarget(255, 254, 255); // by default track white
  tracking.ColorTracker.registerColor('match', function(r, g, b) {
    if(r <= rhi && r >= rlo &&
      g <= ghi && g >= glo &&
      b <= bhi && b >= blo) {
      return true;
    }
    return false;
  });
  tracker = new tracking.ColorTracker(['match']);
  tracker.minDimension = 5;
  tracker.maxDimension = 200;// make this smaller to track smaller objects
  video.elt.id = 'p5video';
  tracking.track('#p5video', tracker);
  tracker.on('track', function(event) {
    clear();
    // strokeWeight(2);
    // stroke(255, 0, 0);
    // noFill();
    event.data.forEach(function(r) {
      // fill(0,255,10);
      // point(r.x,r.y);
     // print("Detected"+" " + r.x+" " + r.y);
      
      osc1.freq(r.x * 4);
      osc2.freq(r.x);
      osc1.freq(osc2);

      env.play();
      
    })
  });
}

function draw() {
  // stroke(0);
  // text("Filter Freq", 35, 580,50,20 );
  // var val = slider.value();
  // // set filter parameters
  // filtera.set(val, 20);
  

  
  if(mouseIsPressed &&
    mouseX > 0 && mouseX < width &&
    mouseY > 0 && mouseY < height) {
    video.loadPixels();
    target = video.get(mouseX, mouseY);
    setTarget(target[0], target[1], target[2]);
    video.loop();
  }

}

function playEnv(){
  env.play();
}
