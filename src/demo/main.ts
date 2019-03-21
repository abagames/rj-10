import * as terminal from "../terminal";
import * as main from "../main";
import * as keyboard from "../util/keyboard";
import * as sound from "../sound";

function init() {
  terminal.clear();
  terminal.print(
    `
########
#      #
#      #
#  ^   #
########
abcdefghijklmn
opqrstuvwxyz
ABCDEFGHIJKLMN
OPQRSTUVWXYZ
`,
    0,
    -1
  );
}

function update() {}

main.init(init, update);
