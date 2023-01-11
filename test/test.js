import { CONSTANTS } from "./public/constants.js";
import Game from "./public/game.js"

QUnit.module("card");

    QUnit.test('OK', function(assert) {
        assert.ok(true);
    });

QUnit.module("Game");

    QUnit.test("key_to_index other, valid", function(assert) {
        assert.equal(Game.key_to_index("D", CONSTANTS.OTHER), CONSTANTS.OTHER_D);
    })

    QUnit.test("key_to_index other, invalid", function(assert) {
        assert.equal(Game.key_to_index("d", CONSTANTS.OTHER), -1);
    })

    QUnit.test("key_to_index mid, valid", function(assert) {
        assert.equal(Game.key_to_index("E", CONSTANTS.OTHER), CONSTANTS.MID_LEFT);
    })

    QUnit.test("key_to_index mid, valid", function(assert) {
        assert.equal(Game.key_to_index("U", CONSTANTS.OTHER), CONSTANTS.MID_RIGHT);
    })

    QUnit.test("key_to_index self, valid", function(assert) {
        assert.equal(Game.key_to_index("D", CONSTANTS.SELF), CONSTANTS.SELF_D);
    })

//Either put game.js in this folder and serve it up with a server or... idk - yeah, just copy the files after copmilation and then setup...
//or check out if using require causes any problems - you are on an alternate branch so go wild i guess