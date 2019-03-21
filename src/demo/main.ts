import * as terminal from "../terminal";
import * as main from "../main";
import * as keyboard from "../util/keyboard";
import * as sound from "../sound";

function init() {
  terminal.print(
    `
########
#      #
#      #
#  a   #
########
`,
    0,
    -1
  );
}

function update() {}

main.init(init, update);
