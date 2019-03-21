import * as terminal from "./terminal";
import { Actor } from "./actor";
import * as sga from "./util/simpleGameActor";

let background;

export function getActors() {
  for (let x = 0; x < terminal.size; x++) {
    for (let y = 0; y < terminal.size; y++) {
      const tc = terminal.getCharAt(x, y);
      if (tc.char === "a") {
        const a = sga.spawn(arrow) as Actor;
        a.pos.set(x, y);
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

const interval = 1;
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

function arrow(a: Actor) {
  a.char = "a";
  a.addUpdater(() => {
    const o = angleOffsets[a.options.angleIndex * 2];
    a.pos.add({ x: o[0], y: o[1] });
  }, interval);
}
