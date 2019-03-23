import * as terminal from "./terminal";
import { Actor } from "./actor";
import { stickAngle } from "./main";
import * as sga from "./util/simpleGameActor";
import { wrap, range } from "./util/math";
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
      if (isActorChar(tc)) {
        const a = sga.spawn(() => {});
        a.pos.set(x, y);
        a.options = tc.options;
        checkConnecting(x, y, 0, 0, tc.options.color).forEach(c => {
          assignActorChar(a, c);
        });
      }
    }
  }
  background = terminal.getState();
}

function assignActorChar(a: Actor, c: { char: string; offset: Vector }) {
  a.addChar({ char: c.char, offset: c.offset });
  actorTypes.forEach(t => {
    if (!t.chars.includes(c.char)) {
      return;
    }
    const u = a.addUpdater((u: sga.Updater & { offset: Vector }) => {
      a.prevPos.set(a.pos);
      t.func(a, u);
    }, t.interval) as sga.Updater & { offset: Vector };
    u.offset = c.offset;
  });
}

function checkConnecting(
  x: number,
  y: number,
  ox: number,
  oy: number,
  color: string
) {
  const c = terminal.getCharAt(x, y);
  if (!isActorChar(c) || c.options.color !== color) {
    return [];
  }
  terminal.setCharAt(x, y, undefined);
  return [{ char: c.char, offset: new Vector(ox, oy) }]
    .concat(checkConnecting(x, y - 1, ox, oy - 1, color))
    .concat(checkConnecting(x + 1, y - 1, ox + 1, oy - 1, color))
    .concat(checkConnecting(x + 1, y, ox + 1, oy, color))
    .concat(checkConnecting(x, y + 1, ox, oy + 1, color))
    .concat(checkConnecting(x + 1, y + 1, ox + 1, oy + 1, color));
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

function isActorChar(c: { char: string; options: terminal.CharOptions }) {
  return (
    c.char != null &&
    c.options.color != null &&
    c.options.color != "w" &&
    c.options.color != "l"
  );
}
