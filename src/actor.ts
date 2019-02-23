import * as sga from "./util/simpleGameActor";
import { Vector } from "./util/vector";
import * as terminal from "./terminal";

export class Actor extends sga.Actor {
  pos = new Vector();
  str = "";
  color = "w";

  update() {
    super.update();
    if (this.isAlive) {
      terminal.print(this.str, this.pos.x, this.pos.y, this.color);
    }
  }
}
