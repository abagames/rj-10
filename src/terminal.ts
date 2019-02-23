import { letterPatterns } from "./util/letterPattern";
import * as view from "./view";

const rgbNumbers = [
  0xe91e63,
  0x4caf50,
  0xffeb3b,
  0x3f51b5,
  0x9c27b0,
  0x03a9f4,
  0xeeeeee
];
const rgbObjects = rgbNumbers.map(n => {
  return {
    r: (n & 0xff0000) >> 16,
    g: (n & 0xff00) >> 8,
    b: n & 0xff
  };
});
const colorChars = "rgybpcw";

let dotPatterns: { x: number; y: number; color: string }[][];

export function init() {
  dotPatterns = [];
  letterPatterns.forEach(lp => {
    let dots = [];
    const p = lp.split("\n").slice(1, 6);
    p.forEach((l, y) => {
      for (let x = 0; x < 5; x++) {
        const c = l.charAt(x);
        if (c !== "" && colorChars.indexOf(c) >= 0) {
          dots.push({ x, y, color: c });
        }
      }
    });
    dotPatterns.push(dots);
  });
}

export function print(str: string, x: number, y: number, color = "w") {
  const bx = x;
  for (let i = 0; i < str.length; i++) {
    const r = printChar(str[i], x, y, color);
    if (r === "cr") {
      x = bx;
      y++;
    } else {
      x++;
    }
  }
}

export type PrintCharResult = "char" | "space" | "cr";

export function printChar(
  c: string,
  _x: number,
  _y: number,
  color = "w"
): PrintCharResult {
  const cc = c.charCodeAt(0);
  if (cc === 0xa) {
    return "cr";
  } else if (cc < 0x21 || cc > 0x60) {
    return "space";
  }
  const x = Math.floor(_x);
  const y = Math.floor(_y);
  if (x < 0 || x > 15 || y < 0 || y > 15) {
    return "char";
  }
  const rgb = rgbObjects[colorChars.indexOf(color)];
  dotPatterns[cc - 0x21].forEach(d => {
    view.fillRect(
      x * 24 + d.x * 4 + 24 + 4 + 2,
      y * 24 + d.y * 4 + 24 + 4 + 2,
      4,
      4,
      rgb,
      0.7
    );
  });
  return "char";
}
