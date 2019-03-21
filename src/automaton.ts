import * as terminal from "./terminal";
import { Actor } from "./actor";
import * as sga from "./util/simpleGameActor";
import { Vector } from "./util/vector";
import { wrap } from "./util/math";

let background;

const arrowChars = "^Z>nvz<N";
const actorTypes = [{ chars: arrowChars, func: arrow, interval: 1 }];

export function getActors() {
  for (let x = 0; x < terminal.size; x++) {
    for (let y = 0; y < terminal.size; y++) {
      const tc = terminal.getCharAt(x, y);
      if (tc.char != null) {
        actorTypes.forEach(t => {
          if (!t.chars.includes(tc.char)) {
            return;
          }
          const a = sga.spawn(t.func, t.interval) as Actor;
          a.pos.set(x, y);
          a.char = tc.char;
          a.options = tc.options;
          terminal.setCharAt(x, y, undefined);
        });
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

function arrow(a: Actor, interval: number) {
  const angleOffsets = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1]
  ];
  const reflectSlash = [2, 0, -2, 4, 2, 0, -2, 4];
  const reflectBackSlash = [-2, 4, 2, 0, -2, 4, 2, 0];
  const reflectHorizontal = [4, 2, 0, -2, 4, 2, 0, -2];
  const reflectVertical = [0, -2, 4, 2, 0, -2, 4, 2];
  const pp = new Vector();
  a.addUpdater(() => {
    let ai = arrowChars.indexOf(a.char);
    const o = angleOffsets[ai];
    pp.set(a.pos);
    a.pos.add({ x: o[0], y: o[1] });
    const c = terminal.getCharAt(a.pos.x, a.pos.y).char;
    if (!isSpaceChar(c)) {
      if (c === "/") {
        ai += reflectSlash[ai];
      } else if (c === "\\") {
        ai += reflectBackSlash[ai];
      } else if (ai % 2 === 0) {
        ai += 4;
        a.pos.set(pp);
      } else {
        const sx = isSpaceChar(terminal.getCharAt(pp.x + o[0], pp.y).char);
        const sy = isSpaceChar(terminal.getCharAt(pp.x, pp.y + o[1]).char);
        if (sx && !sy) {
          ai += reflectHorizontal[ai];
        } else if (!sx && sy) {
          ai += reflectVertical[ai];
        } else {
          ai += 4;
        }
        a.pos.set(pp);
      }
      ai = wrap(ai, 0, 8);
      a.char = arrowChars.charAt(ai);
    }
  }, interval);
}

function isSpaceChar(c: string) {
  return c == null || c === " ";
}
