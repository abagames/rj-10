import * as sga from "./util/simpleGameActor";
import { Vector } from "./util/vector";
import * as terminal from "./terminal";
import { wrap } from "./util/math";

export class Actor extends sga.Actor {
  pos = new Vector();
  prevPos = new Vector();
  intPos = new Vector();
  char = "";
  options = undefined as terminal.CharOptions;

  update() {
    this.prevPos.set(this.pos);
    super.update();
    this.pos.x = wrap(this.pos.x, 0, terminal.size);
    this.pos.y = wrap(this.pos.y, 0, terminal.size);
    this.intPos.set(Math.floor(this.pos.x), Math.floor(this.pos.y));
    if (this.options.color === "c") {
      this.handlePlayer();
    }
  }

  handlePlayer() {
    sga.pool.get().forEach((a: Actor) => {
      if (a.options.color !== "r") {
        return;
      }
      if (this.testCollision(a)) {
        this.remove();
        a.remove();
      }
    });
  }

  testCollision(other: Actor) {
    return this.intPos.x === other.intPos.x && this.intPos.y === other.intPos.y;
  }

  draw() {
    terminal.setCharAt(this.intPos.x, this.intPos.y, this.char, this.options);
  }
}
