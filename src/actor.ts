import * as sga from "./util/simpleGameActor";
import { Vector } from "./util/vector";
import * as terminal from "./terminal";

export class Actor extends sga.Actor {
  pos = new Vector();
  char = "";
  options = undefined as terminal.CharOptions;

  draw() {
    terminal.setCharAt(this.pos.x, this.pos.y, this.char, this.options);
  }
}
