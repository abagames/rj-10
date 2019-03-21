import * as sga from "./util/simpleGameActor";
import { Vector } from "./util/vector";
import * as terminal from "./terminal";
import { wrap } from "./util/math";

export class Actor extends sga.Actor {
  pos = new Vector();
  char = "";
  options = undefined as terminal.CharOptions;

  update() {
    super.update();
    this.pos.x = wrap(this.pos.x, 0, terminal.size);
    this.pos.y = wrap(this.pos.y, 0, terminal.size);
  }

  draw() {
    terminal.setCharAt(this.pos.x, this.pos.y, this.char, this.options);
  }
}
