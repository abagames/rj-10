import * as keyboard from "./util/keyboard";
import { init as initPointer, Pointer } from "./util/pointer";
import { Vector } from "./util/vector";
import * as view from "./view";
import * as sound from "./sound";
import * as terminal from "./terminal";

let updateFunc: Function;
let isInitialized = false;
let lastFrameTime = 0;
export let pointer: Pointer;

export function init(_initFunc: Function, _updateFunc: Function) {
  _initFunc();
  updateFunc = _updateFunc;
  if (isInitialized) {
    return;
  }
  isInitialized = true;
  keyboard.init({ onKeyDown: sound.resumeAudioContext });
  initPointer(sound.resumeAudioContext);
  pointer = new Pointer(view.fxCanvas, new Vector(view.size, view.size));
  view.init();
  terminal.init();
  update();
}

function update() {
  requestAnimationFrame(update);
  const now = window.performance.now();
  const timeSinceLast = now - lastFrameTime;
  if (timeSinceLast < 1000 / 60 - 5) {
    return;
  }
  lastFrameTime = now;
  keyboard.update();
  pointer.update();
  updateFunc();
  view.update();
}
