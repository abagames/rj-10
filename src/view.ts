//import * as gcc from "gif-capture-canvas";

export const size = 432;
export const bloomScale = 8;
export let canvas: HTMLCanvasElement;
export let context: CanvasRenderingContext2D;
export let bloomCanvas: HTMLCanvasElement;
export let bloomContext: CanvasRenderingContext2D;

let updateFunc: Function;
let capturingCanvas: HTMLCanvasElement;
let capturingContext: CanvasRenderingContext2D;
let isCapturing = false;

export function init(
  _initFunc: Function,
  _updateFunc: Function,
  _isCapturing: boolean
) {
  updateFunc = _updateFunc;
  isCapturing = _isCapturing;
  if (context != null) {
    _initFunc();
    return;
  }
  canvas = document.createElement("canvas");
  canvas.classList.add("centering");
  canvas.width = canvas.height = size;
  context = canvas.getContext("2d");
  bloomCanvas = document.createElement("canvas");
  bloomCanvas.classList.add("centering");
  bloomCanvas.width = bloomCanvas.height = size / bloomScale;
  bloomCanvas.style.opacity = "0.7";
  bloomContext = bloomCanvas.getContext("2d");
  document.body.appendChild(canvas);
  document.body.appendChild(bloomCanvas);
  if (isCapturing) {
    //gcc.setOptions({ scale: 0.5, capturingFps: 30 });
    capturingCanvas = document.createElement("canvas");
    capturingCanvas.width = size;
    capturingCanvas.height = size / 2;
    capturingContext = capturingCanvas.getContext("2d");
  }
  _initFunc();
  update();
}

const bloomRatio = 1.5;

export function fillRect(
  x: number,
  y: number,
  width: number,
  height: number,
  color: { r: number; g: number; b: number },
  brightness: number
) {
  const b = Math.sqrt(brightness);
  context.fillStyle = `rgb(${Math.floor(color.r * b)},${Math.floor(
    color.g * b
  )},${Math.floor(color.b * b)})`;
  context.fillRect(x - width / 2, y - width / 2, width, height);
  bloomContext.fillStyle = `rgb(${Math.floor(
    color.r * brightness * bloomRatio
  )},${Math.floor(color.g * brightness * bloomRatio)},${Math.floor(
    color.b * brightness * bloomRatio
  )})`;
  const w = width * brightness;
  const h = height * brightness;
  bloomContext.fillRect(
    (x - w) / bloomScale,
    (y - h) / bloomScale,
    (w * 2) / bloomScale,
    (h * 2) / bloomScale
  );
}

function clear() {
  context.fillStyle = "black";
  context.fillRect(0, 0, size, size);
  bloomContext.clearRect(0, 0, size / bloomScale, size / bloomScale);
}

function capture() {
  capturingContext.fillStyle = "black";
  capturingContext.fillRect(0, 0, size, size / 2);
  capturingContext.drawImage(canvas, size / 4, 0, size / 2, size / 2);
  capturingContext.drawImage(bloomCanvas, size / 4, 0, size / 2, size / 2);
  //gcc.capture(capturingCanvas);
}

let lastFrameTime = 0;

function update() {
  requestAnimationFrame(update);
  const now = window.performance.now();
  const timeSinceLast = now - lastFrameTime;
  if (timeSinceLast < 1000 / 60 - 5) {
    return;
  }
  clear();
  updateFunc();
  if (isCapturing) {
    capture();
  }
  lastFrameTime = now;
}
