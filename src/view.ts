import * as fx from "./glfx/";
import colorShift from "./glfx/shader/colorshift";
//import scanlines from "./glfx/shader/scanlines";
import * as gcc from "gif-capture-canvas";
import { Vector, VectorLike } from "./util/vector";

export const size = new Vector();
export let fxCanvas;
export let canvas: HTMLCanvasElement;
export let context: CanvasRenderingContext2D;

const isCapturing = false;
let captureCanvas: HTMLCanvasElement;
let captureContext: CanvasRenderingContext2D;
let texture;
//let ticks = 0;

export function init() {
  fxCanvas = fx.canvas();
  fxCanvas.colorShift = fx.wrap(colorShift);
  //fxCanvas.scanlines = fx.wrap(scanlines);
  fxCanvas.classList.add("centering");
  canvas = document.createElement("canvas");
  context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  texture = fxCanvas.texture(canvas);
  document.body.appendChild(fxCanvas);
}

export function setSize(_size: VectorLike) {
  size.set(_size);
  if (size.x > size.y) {
    fxCanvas.style.width = "95vmin";
    fxCanvas.style.height = `${(95 * size.y) / size.x}vmin`;
  } else {
    fxCanvas.style.width = `${(95 * size.x) / size.y}vmin`;
    fxCanvas.style.height = "95vmin";
  }
  canvas.width = size.x;
  canvas.height = size.y;
  if (isCapturing) {
    captureCanvas = document.createElement("canvas");
    const cw = size.y * 2;
    captureCanvas.width = size.x > cw ? size.x : cw;
    captureCanvas.height = size.y;
    captureContext = captureCanvas.getContext("2d");
    captureContext.fillStyle = "black";
    gcc.setOptions({ scale: 1, capturingFps: 30 });
  }
}

export function clear() {
  context.fillStyle = "black";
  context.fillRect(0, 0, size.x, size.y);
}

export function update() {
  texture.loadContentsOf(canvas);
  fxCanvas
    .draw(texture)
    .colorShift()
    //.scanlines(ticks * canvas.height * 0.000005)
    .bulgePinch(canvas.width / 2, canvas.height / 2, canvas.width * 0.8, 0.1)
    .vignette(0.2, 0.5)
    .update();
  if (isCapturing) {
    captureContext.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
    captureContext.drawImage(
      fxCanvas,
      (captureCanvas.width - canvas.width) / 2,
      0
    );
    gcc.capture(captureCanvas);
  }
  //ticks++;
}
