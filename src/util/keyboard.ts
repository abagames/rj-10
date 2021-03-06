import { Vector } from "./vector";
import { range, wrap } from "./math";

export let isPressed = false;
export let isJustPressed = false;
export const stick = new Vector();
export let stickAngle: number;
export const isStickPressed = range(4).map(() => false);
export const isStickJustPressed = range(4).map(() => false);

let options = {
  isUsingStickKeysAsButton: false,
  isFourWaysStick: false,
  onKeyDown: undefined as Function
};
let isInitialized = false;

const isKeyPressing = range(256).map(() => false);
const isKeyPressed = range(256).map(() => false);
const stickKeys = [
  [39, 68, 102],
  [40, 83, 101, 98],
  [37, 65, 100],
  [38, 87, 104]
];
const stickXys = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const buttonKeys = [
  90,
  88,
  67,
  86,
  66,
  78,
  77,
  188,
  190,
  191,
  17,
  16,
  18,
  32,
  13
];

export function init(_options?: {
  isUsingStickKeysAsButton?: boolean;
  isFourWaysStick?: boolean;
  onKeyDown?: Function;
}) {
  options = { ...options, ..._options };
  if (isInitialized) {
    return;
  }
  document.addEventListener("keydown", e => {
    isKeyPressing[e.keyCode] = isKeyPressed[e.keyCode] = true;
    if (options.onKeyDown != null) {
      options.onKeyDown();
    }
  });
  document.addEventListener("keyup", e => {
    isKeyPressing[e.keyCode] = false;
  });
  isInitialized = true;
}

export function update() {
  if (!isInitialized) {
    return;
  }
  const pp = isPressed;
  isPressed = isJustPressed = false;
  range(4).forEach(i => {
    isStickPressed[i] = isStickJustPressed[i] = false;
  });
  stick.set(0);
  stickKeys.forEach((ks, i) => {
    ks.forEach(k => {
      if (isKeyPressing[k] || isKeyPressed[k]) {
        stick.x += stickXys[i][0];
        stick.y += stickXys[i][1];
        isStickPressed[i] = true;
        if (options.isUsingStickKeysAsButton) {
          isPressed = true;
        }
        if (isKeyPressed[k]) {
          isKeyPressed[k] = false;
          isStickJustPressed[i] = true;
          if (options.isUsingStickKeysAsButton && !pp) {
            isJustPressed = true;
          }
        }
      }
    });
  });
  stickAngle = 0;
  if (stick.length > 0) {
    setStickAngle(stick.getAngle());
  }
  buttonKeys.forEach(k => {
    if (isKeyPressing[k]) {
      isPressed = true;
    }
    if (isKeyPressed[k]) {
      isKeyPressed[k] = false;
      if (!pp) {
        isPressed = isJustPressed = true;
      }
    }
  });
}

const angleOffsets = [1, 0, 1, 1, 0, 1, -1, 1, -1, 0, -1, -1, 0, -1, 1, -1];

function setStickAngle(a: number) {
  const wayAngle = options.isFourWaysStick ? Math.PI / 2 : Math.PI / 4;
  const angleStep = options.isFourWaysStick ? 2 : 1;
  stickAngle = wrap(Math.round(a / wayAngle) * angleStep, 0, 8);
  stick.set(angleOffsets[stickAngle * 2], angleOffsets[stickAngle * 2 + 1]);
  stickAngle++;
}

export function clearJustPressed() {
  isJustPressed = false;
  isPressed = true;
}
