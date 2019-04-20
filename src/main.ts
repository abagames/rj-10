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
let centerPos = new Vector();
let offsetFromCenter = new Vector();
let pointerAngle = 0;
const cursorChars = "+>nvz<N^Z";
const interval = 15;
let ticks = 0;
let leftTime: number;
let hasGoal: boolean;
let playerCount: number;
let isInGame: boolean;
let isSucceeded: boolean;
let levels: string[];
let currentLevel = 0;

export type Options = {
  isTestingSpecificLevel: number;
};
let options: Options;

const defaultOptions: Options = {
  isTestingSpecificLevel: undefined
};

export function init(_levels: string[], _options?: Options) {
  options = { ...defaultOptions, ..._options };
  levels = _levels;
  if (options.isTestingSpecificLevel != null) {
    currentLevel = wrap(options.isTestingSpecificLevel, 0, levels.length);
  }
  view.init();
  keyboard.init({ onKeyDown: sound.resumeAudioContext });
  initPointer(sound.resumeAudioContext);
  pointer = new Pointer(view.fxCanvas, false, new Vector(0.5, 0.5));
  terminal.init();
  sga.setActorClass(Actor);
  startLevel();
  update();
}

function startLevel() {
  parseLevel(levels[currentLevel]);
}

function parseLevel(str: string) {
  const sl = str.split("\n");
  const sx = Math.max(...sl.map(l => l.length));
  const sy = (sl.length - 2) / 2;
  const size = new Vector(sx, sy);
  view.setSize({
    x: (size.x + 2) * 6 * 2,
    y: (size.y + 2 + terminal.paddingTop + terminal.paddingBottom) * 6 * 2
  });
  centerPos.set(view.size.x / 2, view.size.y / 2);
  pointer.setSize(view.size);
  terminal.setSize(size);
  terminal.printWithColor(str);
  sga.reset();
  automaton.getActors();
  automaton.initActors();
  hasGoal = sga.pool.get().some((a: Actor) => a.type === "goal");
  playerCount = countPlayer();
  isInGame = true;
  leftTime = 10;
  terminal.setTopCharOption("l", "w");
  terminal.setBottomCharOption("l", "w");
  terminal.printTop(`LEVEL ${currentLevel + 1}`);
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
    leftTime -= 15 / 60;
    if (isInGame) {
      if (leftTime <= 0) {
        if (hasGoal) {
          failGame();
        } else {
          successGame();
        }
      } else {
        const bl = `${leftTime > 9 ? " " : Math.ceil(leftTime)}${range(
          Math.ceil(leftTime)
        )
          .map(() => "-")
          .join("")}`;
        terminal.printBottom(bl);
      }
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
    if (!isInGame && leftTime < -1) {
      terminal.clear();
      terminal.setTopCharOption("l", "l");
      terminal.setBottomCharOption("l", "l");
    }
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
    if (!isInGame && leftTime < -1) {
      if (isSucceeded && options.isTestingSpecificLevel == null) {
        currentLevel = wrap(currentLevel + 1, 0, levels.length);
      }
      startLevel();
    }
  }
  ticks++;
}

// cSpell: disable
function successGame() {
  terminal.setBottomCharOption("l", "y");
  terminal.printBottom("SUCCESS");
  sound.play(0, "e>e<c>c<e>g<e>a");
  sound.play(1, "e8>e8");
  isInGame = false;
  isSucceeded = true;
  leftTime = 0;
}

function failGame() {
  terminal.setBottomCharOption("l", "r");
  terminal.printBottom("FAIL");
  sound.play(0, ">aegdc<c>c<c");
  sound.play(1, "a8<a8");
  isInGame = false;
  isSucceeded = false;
  leftTime = 0;
}
// cSpell: enable

function countPlayer() {
  let c = 0;
  for (let a of sga.pool.get() as Actor[]) {
    if (a.type === "player") {
      c++;
    }
  }
  return c;
}
