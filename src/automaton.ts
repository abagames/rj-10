import * as terminal from "./terminal";
import { Actor } from "./actor";
import { stickAngle } from "./main";
import * as sga from "./util/simpleGameActor";
import { wrap } from "./util/math";
import { Vector } from "./util/vector";

const arrowChars = ">nvz<N^Z";
const actorTypes: { chars: string; func: Function; interval: number }[] = [
  { chars: arrowChars, func: arrow, interval: 2 },
  { chars: "@", func: operated, interval: 1 }
];
let background;

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
          const u = a.addUpdater((u: sga.Updater & { offset: Vector }) => {
            a.prevPos.set(a.pos);
            t.func(a, u);
          }, t.interval) as sga.Updater & { offset: Vector };
          u.offset = new Vector(0);
          isSpawning = true;
        });
        if (!isSpawning) {
          a = sga.spawn(() => {});
        }
        a.pos.set(x, y);
        a.addChar({ char: tc.char, offset: new Vector(0) });
        /*if (tc.char === "^") {
          a.addChar({ char: ">", offset: new Vector(1, 0) });
          const u = a.addUpdater((u: sga.Updater & { offset: Vector }) => {
            a.prevPos.set(a.pos);
            arrow(a, u);
          }, 2) as sga.Updater & { offset: Vector };
          u.offset = new Vector(1, 0);
        }*/
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

function arrow(a: Actor, u: sga.Updater & { offset: Vector }) {
  const reflectSlash = [-2, 4, 2, 0, -2, 4, 2, 0];
  const reflectBackSlash = [2, 0, -2, 4, 2, 0, -2, 4];
  const reflectHorizontal = [0, -2, 4, 2, 0, -2, 4, 2];
  const reflectVertical = [4, 2, 0, -2, 4, 2, 0, -2];
  let ai = arrowChars.indexOf(a.getChar(u.offset).char);
  const o = angleOffsets[ai];
  a.pos.add({ x: o[0], y: o[1] });
  const cs = a.getTerminalChars();
  if (!isEmpty(cs)) {
    if (cs.includes("/")) {
      ai += reflectSlash[ai];
    } else if (cs.includes("\\")) {
      ai += reflectBackSlash[ai];
    } else if (ai % 2 === 0) {
      ai += 4;
      a.pos.set(a.prevPos);
    } else {
      const ex = isEmpty(a.getTerminalChars({ x: 0, y: -o[1] }));
      const ey = isEmpty(a.getTerminalChars({ x: -o[0], y: 0 }));
      if (ex && !ey) {
        ai += reflectHorizontal[ai];
      } else if (!ex && ey) {
        ai += reflectVertical[ai];
      } else {
        ai += 4;
      }
      a.pos.set(a.prevPos);
    }
    ai = wrap(ai, 0, 8);
    a.setChar(arrowChars.charAt(ai), u.offset);
  }
}

function operated(a: Actor) {
  if (stickAngle === 0) {
    return;
  }
  const o = angleOffsets[stickAngle - 1];
  a.pos.add({ x: o[0], y: o[1] });
  if (isEmpty(a.getTerminalChars())) {
    return;
  }
  const ex = isEmpty(a.getTerminalChars({ x: 0, y: -o[1] }));
  const ey = isEmpty(a.getTerminalChars({ x: -o[0], y: 0 }));
  if (ex && !ey) {
    a.pos.y = a.prevPos.y;
  } else if (!ex && ey) {
    a.pos.x = a.prevPos.x;
  } else {
    a.pos.set(a.prevPos);
  }
}

function isEmpty(cs: string) {
  return ![...cs].some(c => c != null && c !== " ");
}
