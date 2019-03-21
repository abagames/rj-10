import * as terminal from "./terminal";
import { Actor } from "./actor";
import * as sga from "./util/simpleGameActor";

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
  a.addUpdater(() => {
    const ai = arrowChars.indexOf(a.char);
    const o = angleOffsets[ai];
    a.pos.add({ x: o[0], y: o[1] });
  }, interval);
}
