import * as sga from "./util/simpleGameActor";
import { Vector, VectorLike } from "./util/vector";
import * as terminal from "./terminal";
import { wrap } from "./util/math";
import { play } from "./sound";

type ActorType = "player" | "enemy" | "goal" | "wall" | "none";
type CharPart = { char: string; offset: Vector };

export class Actor extends sga.Actor {
  pos = new Vector();
  prevPos = new Vector();
  chars: CharPart[] = [];
  options = undefined as terminal.CharOptions;
  type: ActorType;
  size = new Vector();
  connecting: CharPart[];
  isFired = false;
  intervalChangeOffsets: { offset: VectorLike; ratio: number }[] = [];

  initType() {
    const actorTypeColors: {
      colors: String;
      type: ActorType;
      priority: number;
    }[] = [
      { colors: "cb", type: "player", priority: 2 },
      { colors: "rp", type: "enemy", priority: 1 },
      { colors: "gy", type: "goal", priority: 3 },
      { colors: "a", type: "wall", priority: 4 }
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
    this.updaterPool.get().forEach((u: any) => {
      const o = u.offset;
      this.intervalChangeOffsets.forEach(co => {
        if (Math.abs(o.x - co.offset.x) + Math.abs(o.y - co.offset.y) === 1) {
          u.interval = Math.ceil(u.interval * co.ratio);
        }
      });
    });
  }

  update() {
    if (this.isFired) {
      this.isFired = false;
    } else {
      super.update();
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
          a.remove();
        } else if (a.type === "goal") {
          play(0, ">gbdb");
          play(1, ">g4");
          a.remove();
        }
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
    const ac = sga.pool
      .get()
      .map((o: Actor) =>
        (o !== this &&
          (this.type !== "player" &&
            (o.type === "goal" || o.type === "wall"))) ||
        (this.type === "player" && o.type === "wall")
          ? this.getCollidingChars(o, offset)
          : undefined
      )
      .join("");
    return tc + ac;
  }

  testCollision(other: Actor) {
    return this.chars.some(c =>
      other.chars.some(
        oc =>
          wrap(this.pos.x + c.offset.x, 0, terminal.size.x) ===
            wrap(other.pos.x + oc.offset.x, 0, terminal.size.x) &&
          wrap(this.pos.y + c.offset.y, 0, terminal.size.y) ===
            wrap(other.pos.y + oc.offset.y, 0, terminal.size.y)
      )
    );
  }

  getCollidingChars(other: Actor, offset: VectorLike) {
    return this.chars
      .map(c =>
        other.chars
          .map(oc =>
            wrap(this.pos.x + offset.x + c.offset.x, 0, terminal.size.x) ===
              wrap(other.pos.x + oc.offset.x, 0, terminal.size.x) &&
            wrap(this.pos.y + offset.y + c.offset.y, 0, terminal.size.y) ===
              wrap(other.pos.y + oc.offset.y, 0, terminal.size.y)
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
        wrap(this.pos.x + c.offset.x, 0, terminal.size.x) ===
          wrap(pos.x, 0, terminal.size.x) &&
        wrap(this.pos.y + c.offset.y, 0, terminal.size.y) ===
          wrap(pos.y, 0, terminal.size.y)
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
