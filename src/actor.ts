import * as sga from "./util/simpleGameActor";
import { Vector } from "./util/vector";
import * as terminal from "./terminal";
import { wrap } from "./util/math";

type ActorType = "player" | "enemy" | "goal";

export class Actor extends sga.Actor {
  pos = new Vector();
  prevPos = new Vector();
  intPos = new Vector();
  char = "";
  options = undefined as terminal.CharOptions;
  type: ActorType;

  update() {
    if (this.type == null) {
      const actorTypeColors: { colors: string; type: ActorType }[] = [
        { colors: "cb", type: "player" },
        { colors: "rp", type: "enemy" },
        { colors: "gy", type: "goal" }
      ];
      actorTypeColors.forEach(c => {
        if (c.colors.includes(this.options.color)) {
          this.type = c.type;
        }
      });
    }
    this.prevPos.set(this.pos);
    super.update();
    this.pos.x = wrap(this.pos.x, 0, terminal.size.x);
    this.pos.y = wrap(this.pos.y, 0, terminal.size.y);
    this.intPos.set(Math.floor(this.pos.x), Math.floor(this.pos.y));
    if (this.type === "player") {
      this.handlePlayer();
    }
  }

  handlePlayer() {
    sga.pool.get().forEach((a: Actor) => {
      if (a.type === "player") {
        return;
      }
      if (this.testCollision(a)) {
        if (a.type === "enemy") {
          this.remove();
        }
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
