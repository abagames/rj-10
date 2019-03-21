import * as keyboard from "./util/keyboard";
import { init as initPointer, Pointer } from "./util/pointer";
import { Vector } from "./util/vector";
import * as sga from "./util/simpleGameActor";
import * as view from "./view";
import * as sound from "./sound";
import * as terminal from "./terminal";
import * as automaton from "./automaton";
import { Actor } from "./actor";

let updateFunc: Function;
let lastFrameTime = 0;
export let pointer: Pointer;

export function init(_initFunc: Function, _updateFunc: Function) {
  _initFunc();
  sga.reset();
  updateFunc = _updateFunc;
  keyboard.init({ onKeyDown: sound.resumeAudioContext });
  initPointer(sound.resumeAudioContext);
  pointer = new Pointer(view.fxCanvas, new Vector(view.size, view.size));
  view.init();
  terminal.init();
  sga.setActorClass(Actor);
  automaton.getActors();
  update();
}

const interval = 30;
let ticks = 0;

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
  if (ticks % interval === 0) {
    view.clear();
    updateFunc();
    automaton.update();
    terminal.update();
    view.update();
  }
  ticks++;
}
