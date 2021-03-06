import * as fx from "./glfx/";
import colorShift from "./glfx/shader/colorshift";
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

const bodyCss = `
-webkit-touch-callout: none;
-webkit-tap-highlight-color: black;
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
background: black;
color: white;
`;
const canvasCss = `
position: absolute;
left: 50%;
top: 50%;
transform: translate(-50%, -50%);
width: 95vmin;
height: 95vmin;
`;

export function init() {
  document.body.style.cssText = bodyCss;
  fxCanvas = fx.canvas();
  fxCanvas.colorShift = fx.wrap(colorShift);
  fxCanvas.style.cssText = canvasCss;
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
    gcc.setOptions({ scale: 1, capturingFps: 4, appFps: 4 });
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
}
