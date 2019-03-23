import * as sga from "./util/simpleGameActor";
import { Vector } from "./util/vector";
import * as terminal from "./terminal";
import { wrap } from "./util/math";

type ActorType = "player" | "enemy" | "goal";
type CharPart = { char: string; offset: Vector };

export class Actor extends sga.Actor {
  pos = new Vector();
  prevPos = new Vector();
  chars: CharPart[] = [];
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
    super.update();
    this.pos.x = wrap(this.pos.x, 0, terminal.size.x);
    this.pos.y = wrap(this.pos.y, 0, terminal.size.y);
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

  addChar(c: CharPart) {
    this.chars.push(c);
  }

  getChar(offset: Vector) {
    for (let c of this.chars) {
      if (c.offset.equals(offset)) {
        return c;
      }
    }
  }

  setChar(char: string, offset: Vector) {
    for (let c of this.chars) {
      if (c.offset.equals(offset)) {
        c.char = char;
        return;
      }
    }
  }

  getTerminalChars(offset = { x: 0, y: 0 }) {
    return this.chars
      .map(
        c =>
          terminal.getCharAt(
            this.pos.x + c.offset.x + offset.x,
            this.pos.y + c.offset.y + offset.y
          ).char
      )
      .join("");
  }

  testCollision(other: Actor) {
    return this.pos.x === other.pos.x && this.pos.y === other.pos.y;
  }

  draw() {
    this.chars.forEach(c => {
      terminal.setCharAt(
        wrap(this.pos.x + c.offset.x, 0, terminal.size.x),
        wrap(this.pos.y + c.offset.y, 0, terminal.size.y),
        c.char,
        this.options
      );
    });
  }
}
