import * as fx from "./glfx/";
import colorShift from "./glfx/shader/colorshift";
import scanlines from "./glfx/shader/scanlines";
//import * as gcc from "gif-capture-canvas";

export const size = 432;
export let fxCanvas;
export let canvas: HTMLCanvasElement;
export let context: CanvasRenderingContext2D;

let updateFunc: Function;
let texture;
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
  fxCanvas = fx.canvas();
  fxCanvas.colorShift = fx.wrap(colorShift);
  fxCanvas.scanlines = fx.wrap(scanlines);
  fxCanvas.classList.add("centering");
  canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  context = canvas.getContext("2d");
  texture = fxCanvas.texture(canvas);
  document.body.appendChild(fxCanvas);
  if (isCapturing) {
    //gcc.setOptions({ scale: 0.5, capturingFps: 30 });
  }
  _initFunc();
  update();
}

let lastFrameTime = 0;
let ticks = 0;

function update() {
  requestAnimationFrame(update);
  const now = window.performance.now();
  const timeSinceLast = now - lastFrameTime;
  if (timeSinceLast < 1000 / 60 - 5) {
    return;
  }
  context.fillStyle = "black";
  context.fillRect(0, 0, size, size);
  updateFunc();
  texture.loadContentsOf(canvas);
  fxCanvas
    .draw(texture)
    .colorShift()
    .scanlines(ticks * canvas.height * 0.000005)
    .bulgePinch(canvas.width / 2, canvas.height / 2, canvas.width * 0.8, 0.1)
    .vignette(0.2, 0.5)
    .update();
  if (isCapturing) {
    //gcc.capture(fxCanvas);
  }
  ticks++;
  lastFrameTime = now;
}
