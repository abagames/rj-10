import * as terminal from "./terminal";
import { Actor } from "./actor";
import * as sga from "./util/simpleGameActor";
import { wrap } from "./util/math";
import { stickAngle } from "./main";

let background;

const arrowChars = ">nvz<N^Z";
const actorTypes = [
  { chars: arrowChars, func: arrow, interval: 2 },
  { chars: "@", func: operated, interval: 1 }
];

export function getActors() {
  for (let x = 0; x < terminal.size.x; x++) {
    for (let y = 0; y < terminal.size.y; y++) {
      const tc = terminal.getCharAt(x, y);
      if (
        tc.char != null &&
        tc.options.color != null &&
        tc.options.color != "w" &&
        tc.options.color != "l"
      ) {
        let isSpawning = false;
        let a: Actor;
        actorTypes.forEach(t => {
          if (isSpawning || !t.chars.includes(tc.char)) {
            return;
          }
          a = sga.spawn(() => {});
          a.addUpdater(() => t.func(a), t.interval);
          isSpawning = true;
        });
        if (!isSpawning) {
          a = sga.spawn(() => {});
        }
        a.pos.set(x, y);
        a.char = tc.char;
        a.options = tc.options;
        terminal.setCharAt(x, y, undefined);
      }
    }
  }
  background = terminal.getState();
}

export function update() {
  terminal.setState(background);
  sga.update();
  sga.pool.get().forEach((a: Actor) => {
    a.draw();
  });
}

const angleOffsets = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1]
];

function arrow(a: Actor) {
  const reflectSlash = [-2, 4, 2, 0, -2, 4, 2, 0];
  const reflectBackSlash = [2, 0, -2, 4, 2, 0, -2, 4];
  const reflectHorizontal = [0, -2, 4, 2, 0, -2, 4, 2];
  const reflectVertical = [4, 2, 0, -2, 4, 2, 0, -2];
  let ai = arrowChars.indexOf(a.char);
  const o = angleOffsets[ai];
  a.pos.add({ x: o[0], y: o[1] });
  const c = terminal.getCharAt(a.pos.x, a.pos.y).char;
  if (!isSpaceChar(c)) {
    if (c === "/") {
      ai += reflectSlash[ai];
    } else if (c === "\\") {
      ai += reflectBackSlash[ai];
    } else if (ai % 2 === 0) {
      ai += 4;
      a.pos.set(a.prevPos);
    } else {
      const sx = isSpaceChar(
        terminal.getCharAt(a.prevPos.x + o[0], a.prevPos.y).char
      );
      const sy = isSpaceChar(
        terminal.getCharAt(a.prevPos.x, a.prevPos.y + o[1]).char
      );
      if (sx && !sy) {
        ai += reflectHorizontal[ai];
      } else if (!sx && sy) {
        ai += reflectVertical[ai];
      } else {
        ai += 4;
      }
      a.pos.set(a.prevPos);
    }
    ai = wrap(ai, 0, 8);
    a.char = arrowChars.charAt(ai);
  }
}

function operated(a: Actor) {
  if (stickAngle === 0) {
    return;
  }
  const o = angleOffsets[stickAngle - 1];
  a.pos.add({ x: o[0], y: o[1] });
  if (isSpaceChar(terminal.getCharAt(a.pos.x, a.pos.y).char)) {
    return;
  }
  const sx = isSpaceChar(
    terminal.getCharAt(a.prevPos.x + o[0], a.prevPos.y).char
  );
  const sy = isSpaceChar(
    terminal.getCharAt(a.prevPos.x, a.prevPos.y + o[1]).char
  );
  if (sx && !sy) {
    a.pos.y = a.prevPos.y;
  } else if (!sx && sy) {
    a.pos.x = a.prevPos.x;
  } else {
    a.pos.set(a.prevPos);
  }
}

function isSpaceChar(c: string) {
  return c == null || c === " ";
}
