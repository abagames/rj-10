import * as fx from "./glfx/";
import colorShift from "./glfx/shader/colorshift";
import scanlines from "./glfx/shader/scanlines";
import * as gcc from "gif-capture-canvas";

export const size = 216;
export let fxCanvas;
export let canvas: HTMLCanvasElement;
export let context: CanvasRenderingContext2D;

const isCapturing = false;
let captureCanvas: HTMLCanvasElement;
let captureContext: CanvasRenderingContext2D;
let texture;
let ticks = 0;

export function init() {
  fxCanvas = fx.canvas();
  fxCanvas.colorShift = fx.wrap(colorShift);
  fxCanvas.scanlines = fx.wrap(scanlines);
  fxCanvas.classList.add("centering");
  canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  texture = fxCanvas.texture(canvas);
  document.body.appendChild(fxCanvas);
  if (isCapturing) {
    captureCanvas = document.createElement("canvas");
    captureCanvas.width = size * 2;
    captureCanvas.height = size;
    captureContext = captureCanvas.getContext("2d");
    captureContext.fillStyle = "black";
    gcc.setOptions({ scale: 1, capturingFps: 30 });
  }
}

export function clear() {
  context.fillStyle = "black";
  context.fillRect(0, 0, size, size);
}

export function update() {
  texture.loadContentsOf(canvas);
  fxCanvas
    .draw(texture)
    .colorShift()
    .scanlines(ticks * canvas.height * 0.000005)
    .bulgePinch(canvas.width / 2, canvas.height / 2, canvas.width * 0.8, 0.1)
    .vignette(0.2, 0.5)
    .update();
  if (isCapturing) {
    captureContext.fillRect(0, 0, size * 2, size);
    captureContext.drawImage(fxCanvas, size / 2, 0);
    gcc.capture(captureCanvas);
  }
  ticks++;
}
