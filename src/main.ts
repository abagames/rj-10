import * as keyboard from "./util/keyboard";
import { init as initPointer, Pointer } from "./util/pointer";
import { Vector } from "./util/vector";
import * as sga from "./util/simpleGameActor";
import * as view from "./view";
import * as sound from "./sound";
import * as terminal from "./terminal";
import * as automaton from "./automaton";
import { Actor } from "./actor";
import { wrap } from "./util/math";

let updateFunc: Function;
let lastFrameTime = 0;
export let pointer: Pointer;

export function init(_initFunc: Function, _updateFunc: Function) {
  _initFunc();
  updateFunc = _updateFunc;
  keyboard.init({ onKeyDown: sound.resumeAudioContext });
  initPointer(sound.resumeAudioContext);
  view.init();
  pointer = new Pointer(
    view.fxCanvas,
    new Vector(view.size, view.size),
    false,
    new Vector(0.5, 0.5)
  );
  terminal.init();
  sga.setActorClass(Actor);
  automaton.getActors();
  update();
}

export let stickAngle = 0;
let isPrevStickPressed = false;
const centerPos = new Vector(view.size / 2, view.size / 2);
let offsetFromCenter = new Vector();
let pointerAngle = 0;
const cursorChars = "+>nvz<N^Z";
const interval = 15;
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
  if (!isPrevStickPressed && keyboard.stickAngle > 0) {
    stickAngle = keyboard.stickAngle;
  }
  pointer.update();
  if (pointer.isPressed) {
    if (pointer.isJustPressed) {
      pointer.setTargetPos(centerPos);
    }
    offsetFromCenter.set(pointer.targetPos).sub(centerPos);
    if (offsetFromCenter.length > 10) {
      const oa = offsetFromCenter.getAngle() / (Math.PI / 4);
      pointerAngle = wrap(Math.round(oa), 0, 8) + 1;
      if (!isPrevStickPressed) {
        stickAngle = pointerAngle;
      }
    }
  } else {
    pointerAngle = 0;
  }
  if (ticks % interval === 0) {
    if (isPrevStickPressed) {
      stickAngle = keyboard.stickAngle;
      if (pointerAngle > 0) {
        stickAngle = pointerAngle;
      }
    }
    view.clear();
    updateFunc();
    automaton.update();
    terminal.update();
    if (pointer.isPressed) {
      view.context.drawImage(
        terminal.letterImages[cursorChars.charCodeAt(pointerAngle) - 33],
        pointer.targetPos.x - 2,
        pointer.targetPos.y - 2
      );
    }
    view.update();
    isPrevStickPressed = stickAngle > 0;
    stickAngle = 0;
  }
  ticks++;
}
