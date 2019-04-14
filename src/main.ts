import * as keyboard from "./util/keyboard";
import { init as initPointer, Pointer } from "./util/pointer";
import { Vector } from "./util/vector";
import * as sga from "./util/simpleGameActor";
import * as view from "./view";
import * as sound from "./sound";
import * as terminal from "./terminal";
import * as automaton from "./automaton";
import { Actor } from "./actor";
import { wrap, range } from "./util/math";

export let pointer: Pointer;
export let stickAngle = 0;
let lastFrameTime = 0;
let isPrevStickPressed = false;
let centerPos: Vector;
let offsetFromCenter = new Vector();
let pointerAngle = 0;
const cursorChars = "+>nvz<N^Z";
const interval = 15;
let ticks = 0;
let leftTime = 4;
let hasGoal: boolean;
let playerCount: number;
let isInGame: boolean;

export function init(str: string) {
  const sl = str.split("\n");
  const sx = Math.max(...sl.map(l => l.length));
  const sy = (sl.length - 2) / 2;
  const size = new Vector(sx, sy);
  view.init({
    x: (size.x + 2) * 6 * 2,
    y: (size.y + 2 + terminal.paddingTop + terminal.paddingBottom) * 6 * 2
  });
  centerPos = new Vector(view.size.x / 2, view.size.y / 2);
  keyboard.init({ onKeyDown: sound.resumeAudioContext });
  initPointer(sound.resumeAudioContext);
  pointer = new Pointer(view.fxCanvas, view.size, false, new Vector(0.5, 0.5));
  terminal.init(size);
  terminal.printWithColor(str);
  sga.setActorClass(Actor);
  automaton.getActors();
  automaton.initActors();
  hasGoal = sga.pool.get().some((a: Actor) => a.type === "goal");
  playerCount = countPlayer();
  isInGame = true;
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
    if (isInGame) {
      leftTime -= 15 / 60;
      if (leftTime <= 0) {
        if (hasGoal) {
          failGame();
        } else {
          successGame();
        }
        return;
      }
      const bl = `${leftTime > 3 ? " " : Math.ceil(leftTime)}${range(
        Math.ceil(leftTime / 0.5)
      )
        .map(() => "-")
        .join("")}`;
      terminal.printBottom(bl);
    }
    view.clear();
    automaton.update();
    if (isInGame) {
      if (hasGoal) {
        if (!sga.pool.get().some((a: Actor) => a.type === "goal")) {
          successGame();
        } else if (countPlayer() === 0) {
          failGame();
        }
      } else {
        if (countPlayer() < playerCount) {
          failGame();
        }
      }
    }
    sound.update();
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

function successGame() {
  terminal.setBottomCharOption("l", "y");
  terminal.printBottom("SUCCESS");
  sound.play(0, "e>e<c>c<e>g<e>a");
  sound.play(1, "e8>e8");
  isInGame = false;
}

function failGame() {
  terminal.setBottomCharOption("l", "r");
  terminal.printBottom("FAIL");
  sound.play(0, ">aegdc<c>c<c");
  sound.play(1, "a8<a8");
  isInGame = false;
}

function countPlayer() {
  let c = 0;
  for (let a of sga.pool.get() as Actor[]) {
    if (a.type === "player") {
      c++;
    }
  }
  return c;
}
