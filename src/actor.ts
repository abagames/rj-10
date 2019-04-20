import * as sga from "./util/simpleGameActor";
import { Vector, VectorLike } from "./util/vector";
import * as terminal from "./terminal";
import { wrap } from "./util/math";
import { play } from "./sound";

type ActorType = "player" | "enemy" | "goal" | "none";
type CharPart = { char: string; offset: Vector };

export class Actor extends sga.Actor {
  pos = new Vector();
  prevPos = new Vector();
  chars: CharPart[] = [];
  options = undefined as terminal.CharOptions;
  type: ActorType;
  size = new Vector();
  connecting: CharPart[];
  isWeak = false;
  isFired = false;
  intervalRatio = 1;

  initType() {
    const actorTypeColors: {
      colors: String;
      type: ActorType;
      priority: number;
    }[] = [
      { colors: "cb", type: "player", priority: 2 },
      { colors: "rp", type: "enemy", priority: 1 },
      { colors: "gy", type: "goal", priority: 3 }
    ];
    actorTypeColors.forEach(c => {
      if (c.colors.includes(this.options.color)) {
        this.type = c.type;
        this.setPriority(c.priority);
      }
    });
    if (this.type == null) {
      this.type = "none";
    }
    for (let c of this.chars) {
      this.size.x = Math.max(this.size.x, c.offset.x);
      this.size.y = Math.max(this.size.y, c.offset.y);
    }
    this.size.x++;
    this.size.y++;
    this.updaterPool.get().forEach((u: sga.Updater) => {
      u.interval = Math.ceil(u.interval * this.intervalRatio);
    });
  }

  update() {
    if (this.isFired) {
      this.isFired = false;
    } else {
      super.update();
    }
    if (
      this.isWeak &&
      (this.pos.x < 0 ||
        this.pos.x + this.size.x >= terminal.size.x ||
        this.pos.y < 0 ||
        this.pos.y + this.size.y >= terminal.size.y)
    ) {
      this.remove();
      return;
    }
    this.pos.x = wrap(this.pos.x, 0, terminal.size.x);
    this.pos.y = wrap(this.pos.y, 0, terminal.size.y);
    if (this.type === "player") {
      this.handlePlayer();
    }
  }

  // cSpell: disable
  handlePlayer() {
    sga.pool.get().forEach((a: Actor) => {
      if (a.type == null || a.type === "player") {
        return;
      }
      if (this.testCollision(a)) {
        if (a.type === "enemy") {
          this.remove();
          play(3, "crcrc");
        } else {
          play(0, ">gbdb");
          play(1, ">g4");
        }
        a.remove();
      }
    });
  }
  // cSpell: enable

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
    const tc = this.chars
      .map(
        c =>
          terminal.getCharAt(
            this.pos.x + c.offset.x + offset.x,
            this.pos.y + c.offset.y + offset.y
          ).char
      )
      .join("");
    if (this.type === "player") {
      return tc;
    }
    const ac = sga.pool
      .get()
      .map((o: Actor) =>
        o === this || o.type !== "goal"
          ? undefined
          : this.getCollidingChars(o, offset)
      )
      .join("");
    return tc + ac;
  }

  testCollision(other: Actor) {
    return this.chars.some(c =>
      other.chars.some(
        oc =>
          this.pos.x + c.offset.x === other.pos.x + oc.offset.x &&
          this.pos.y + c.offset.y === other.pos.y + oc.offset.y
      )
    );
  }

  getCollidingChars(other: Actor, offset: VectorLike) {
    return this.chars
      .map(c =>
        other.chars
          .map(oc =>
            this.pos.x + offset.x + c.offset.x === other.pos.x + oc.offset.x &&
            this.pos.y + offset.y + c.offset.y === other.pos.y + oc.offset.y
              ? oc.char
              : undefined
          )
          .join("")
      )
      .join("");
  }

  testCollisionWithPosition(pos: VectorLike) {
    return this.chars.some(
      c =>
        this.pos.x + c.offset.x === pos.x && this.pos.y + c.offset.y === pos.y
    );
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

export function getActorAt(pos: VectorLike) {
  for (let a of sga.pool.get() as Actor[]) {
    if (a.testCollisionWithPosition(pos)) {
      return a;
    }
  }
}
