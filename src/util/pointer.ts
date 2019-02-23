import { Vector } from "./vector";
import { Random } from "./random";
import { isInRange } from "./math";

export class Pointer {
  pos = new Vector();
  move = new Vector();
  pressedPos = new Vector();
  targetPos = new Vector();
  isPressed = false;
  isJustPressed = false;

  pixelSize: Vector;
  prevPos = new Vector();
  debugRandom = new Random();
  debugPos = new Vector();
  debugMoveVel = new Vector();
  debugIsDown = false;

  constructor(
    public screen: HTMLElement,
    _pixelSize: Vector,
    public isDebugMode = false,
    public anchor: Vector = new Vector(),
    public padding: Vector = new Vector()
  ) {
    this.pixelSize = new Vector(
      _pixelSize.x + padding.x * 2,
      _pixelSize.y + padding.y * 2
    );
    this.targetPos.set(this.pixelSize.x / 2, this.pixelSize.y / 2);
    if (isDebugMode) {
      this.debugPos.set(this.pixelSize.x / 2, this.pixelSize.y / 2);
    }
  }

  update() {
    this.calcPointerPos(cursorPos.x, cursorPos.y, this.pos);
    if (
      this.isDebugMode &&
      !this.pos.isInRect(0, 0, this.pixelSize.x, this.pixelSize.y)
    ) {
      this.updateDebug();
      this.pos.set(this.debugPos);
      this.isJustPressed = !this.isPressed && this.debugIsDown;
      this.isPressed = this.debugIsDown;
    } else {
      this.isJustPressed = !this.isPressed && isClicked;
      this.isPressed = isDown;
    }
    if (this.isJustPressed) {
      this.pressedPos.set(this.pos);
      this.prevPos.set(this.pos);
    }
    this.move.set(this.pos.x - this.prevPos.x, this.pos.y - this.prevPos.y);
    this.prevPos.set(this.pos);
    if (isResettingTargetPos) {
      this.targetPos.set(this.pos);
    } else {
      this.targetPos.add(this.move);
    }
  }

  clearJustPressed() {
    this.isJustPressed = false;
    this.isPressed = true;
  }

  resetPressedPointerPos(ratio = 1) {
    this.pressedPos.x += (this.pos.x - this.pressedPos.x) * ratio;
    this.pressedPos.y += (this.pos.y - this.pressedPos.y) * ratio;
  }

  setTargetPos(v: Vector) {
    this.targetPos.set(v);
  }

  calcPointerPos(x: number, y: number, v: Vector) {
    if (this.screen == null) {
      return;
    }
    v.x =
      ((x - this.screen.offsetLeft) / this.screen.clientWidth + this.anchor.x) *
        this.pixelSize.x -
      this.padding.x;
    v.y =
      ((y - this.screen.offsetTop) / this.screen.clientHeight + this.anchor.y) *
        this.pixelSize.y -
      this.padding.y;
  }

  updateDebug() {
    if (this.debugMoveVel.length > 0) {
      this.debugPos.add(this.debugMoveVel);
      if (
        !isInRange(
          this.debugPos.x,
          -this.pixelSize.x * 0.1,
          this.pixelSize.x * 1.1
        ) &&
        this.debugPos.x * this.debugMoveVel.x > 0
      ) {
        this.debugMoveVel.x *= -1;
      }
      if (
        !isInRange(
          this.debugPos.y,
          -this.pixelSize.y * 0.1,
          this.pixelSize.y * 1.1
        ) &&
        this.debugPos.y * this.debugMoveVel.y > 0
      ) {
        this.debugMoveVel.y *= -1;
      }
      if (this.debugRandom.get() < 0.05) {
        this.debugMoveVel.set(0);
      }
    } else {
      if (this.debugRandom.get() < 0.1) {
        this.debugMoveVel.set(0);
        this.debugMoveVel.addAngle(
          this.debugRandom.get(Math.PI * 2),
          (this.pixelSize.x + this.pixelSize.y) *
            this.debugRandom.get(0.01, 0.03)
        );
      }
    }
    if (this.debugRandom.get() < 0.05) {
      this.debugIsDown = !this.debugIsDown;
    }
  }
}

let cursorPos = new Vector(-9999, -9999);
let isDown = false;
let isClicked = false;
let isResettingTargetPos = false;
let onPointerUp: Function | undefined;

export function init(_onPointerUp?: Function) {
  onPointerUp = _onPointerUp;
  document.addEventListener("mousedown", e => {
    onDown(e.pageX, e.pageY);
  });
  document.addEventListener("touchstart", e => {
    onDown(e.touches[0].pageX, e.touches[0].pageY);
  });
  document.addEventListener("mousemove", e => {
    onMove(e.pageX, e.pageY);
  });
  document.addEventListener(
    "touchmove",
    e => {
      e.preventDefault();
      onMove(e.touches[0].pageX, e.touches[0].pageY);
    },
    { passive: false }
  );
  document.addEventListener("mouseup", e => {
    onUp(e);
  });
  document.addEventListener(
    "touchend",
    e => {
      e.preventDefault();
      (e.target as any).click();
      onUp(e);
    },
    { passive: false }
  );
}

export function resetIsClicked() {
  isClicked = false;
}

function onDown(x: number, y: number) {
  cursorPos.set(x, y);
  isDown = isClicked = true;
  isResettingTargetPos = false;
}

function onMove(x: number, y: number) {
  cursorPos.set(x, y);
  if (!isDown) {
    isResettingTargetPos = true;
  }
}

function onUp(e: Event) {
  isDown = false;
  isResettingTargetPos = false;
  if (onPointerUp != null) {
    onPointerUp();
  }
}
