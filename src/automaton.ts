import * as terminal from "./terminal";
import { Actor, getActorAt } from "./actor";
import { stickAngle } from "./main";
import * as sga from "./util/simpleGameActor";
import { wrap, range } from "./util/math";
import { Vector } from "./util/vector";
import { play } from "./sound";

const arrowChars = ">nvz<N^Z";
const actorTypes: {
  chars: string;
  updaterFunc?: Function;
  interval?: number;
  initFunc?: Function;
}[] = [
  { chars: arrowChars, updaterFunc: arrow, interval: 2 },
  { chars: "R", updaterFunc: rotateRight, interval: 2, initFunc: rotateInit },
  { chars: "L", updaterFunc: rotateLeft, interval: 2, initFunc: rotateInit },
  { chars: "@", updaterFunc: operated, interval: 1 },
  { chars: "F", updaterFunc: fire, interval: 4, initFunc: fireInit },
  { chars: "s", initFunc: slowInit },
  { chars: "f", initFunc: fastInit }
];
let background;

export function getActors() {
  for (let x = 0; x < terminal.size.x; x++) {
    for (let y = 0; y < terminal.size.y; y++) {
      const tc = terminal.getCharAt(x, y);
      if (isActorChar(tc)) {
        spawnActor(
          x,
          y,
          tc.options,
          checkConnecting(x, y, 0, 0, tc.options.color)
        );
      }
    }
  }
  background = terminal.getState();
}

function spawnActor(
  x: number,
  y: number,
  options: terminal.CharOptions,
  connecting
) {
  const a = sga.spawn(() => {}) as Actor;
  a.pos.set(x, y);
  a.options = options;
  a.connecting = connecting;
  connecting.forEach(c => {
    assignActorChar(a, c);
  });
  return a;
}

export function initActors() {
  for (let a of sga.pool.get() as Actor[]) {
    initActor(a);
  }
}

function initActor(a: Actor) {
  for (let u of a.updaterPool.get() as any) {
    actorTypes.forEach(t => {
      if (t.initFunc == null || !t.chars.includes(u.char)) {
        return;
      }
      t.initFunc(u, a);
    });
  }
  a.initType();
}

function assignActorChar(a: Actor, c: { char: string; offset: Vector }) {
  a.addChar({ char: c.char, offset: c.offset });
  actorTypes.forEach(t => {
    if (!t.chars.includes(c.char)) {
      return;
    }
    const u =
      t.updaterFunc == null
        ? a.addUpdater(() => {}, 9999)
        : (a.addUpdater((u: any) => {
            a.prevPos.set(a.pos);
            t.updaterFunc(a, u);
          }, t.interval) as any);
    u.offset = c.offset;
    u.char = c.char;
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
    .concat(checkConnecting(x - 1, y, ox - 1, oy, color))
    .concat(checkConnecting(x, y - 1, ox, oy - 1, color))
    .concat(checkConnecting(x + 1, y, ox + 1, oy, color))
    .concat(checkConnecting(x, y + 1, ox, oy + 1, color));
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

function arrow(a: Actor, u: any) {
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
    } else if (cs.includes("-") || cs.includes("|")) {
      if (ai % 2 === 0) {
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
    } else {
      play(3, "c");
      a.remove();
      return;
    }
    ai = wrap(ai, 0, 8);
    a.setChar(arrowChars.charAt(ai), u.offset);
    play(2, "a<a>a");
  } else {
    play(2, "e");
  }
}

function rotateInit(u) {
  u.angle = 6;
}

function rotateRight(a: Actor, u) {
  rotate(a, u, 2);
}

function rotateLeft(a: Actor, u) {
  rotate(a, u, -2);
}

function rotate(a: Actor, u, rotateAngle: number) {
  u.angle = wrap(u.angle + rotateAngle, 0, 8);
  for (let i = 0; i < 5; i++) {
    const o = angleOffsets[u.angle];
    const ofs = { x: o[0], y: o[1] };
    const ie = isEmpty(a.getTerminalChars(ofs));
    if (ie) {
      a.pos.add(ofs);
      play(2, i === 0 ? "a" : "d");
      break;
    }
    u.angle = wrap(u.angle - rotateAngle, 0, 8);
  }
}

function operated(a: Actor) {
  if (stickAngle === 0) {
    return;
  }
  const o = angleOffsets[stickAngle - 1];
  a.pos.add({ x: o[0], y: o[1] });
  if (isEmpty(a.getTerminalChars())) {
    play(0, "<e");
    return;
  }
  play(0, "<b");
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

function fireInit(u, a: Actor) {
  const nas: Actor[] = [];
  for (let ao of angleOffsets.filter((_, i) => i % 2 == 0)) {
    const na = getActorAt({
      x: a.pos.x + u.offset.x + ao[0],
      y: a.pos.y + u.offset.y + ao[1]
    });
    if (
      na != null &&
      na !== a &&
      nas.indexOf(na) < 0 &&
      !na.connecting.some(c => c.char === "F")
    ) {
      nas.push(na);
      na.remove();
    }
  }
  u.neighboringActors = nas.map(na => {
    return {
      actor: { options: na.options, connecting: na.connecting },
      offset: new Vector(na.pos).sub(a.pos)
    };
  });
}

function fire(a: Actor, u) {
  u.neighboringActors.forEach(na => {
    const sa = spawnActor(
      a.pos.x + na.offset.x,
      a.pos.y + na.offset.y,
      na.actor.options,
      na.actor.connecting
    );
    initActor(sa);
    sa.isFired = true;
  });
  play(1, "b<b");
}

function slowInit(u, a: Actor) {
  a.intervalChangeOffsets.push({ offset: u.offset, ratio: 2 });
}

function fastInit(u, a: Actor) {
  a.intervalChangeOffsets.push({ offset: u.offset, ratio: 0.5 });
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
