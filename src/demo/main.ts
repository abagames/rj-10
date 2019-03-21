import * as terminal from "../terminal";
import * as main from "../main";
import * as keyboard from "../util/keyboard";
import * as sound from "../sound";

function init() {
  terminal.print("", 0, 0, {
    charAndColorPattern: String.raw`
########

#    Z #
     c
#    Z #
     c
#  ^   #
   r
########

`
  });
}

function update() {}

main.init(init, update);
