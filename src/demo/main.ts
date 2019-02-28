import * as terminal from "../terminal";
import * as view from "../view";

function init() {}

function update() {
  terminal.print(
    `
!@#$%^&*()_+
1234567890-=
QWERTYUIOP[]\\
ASDFGHJKL;'
ZXCVBNM,./
:"<>? \`{|}~
abcdefghijkl
mnopqrstuvwxyz
  `,
    0,
    0
  );
}

terminal.init();
view.init(init, update, false);
