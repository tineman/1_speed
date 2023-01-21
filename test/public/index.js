import { updateHTML } from "./animation.js";
import { CONSTANTS } from "./constants.js";
import Game from "./game.js";
import "./keypress.js";
//@ts-ignore
var socket = io();
const modaldiv = document.getElementById("modal");
const gamediv = document.getElementById("game");
const menudiv = document.getElementById("menu");
const create_game = document.getElementById("create_game");
const game_id = document.getElementById("game-id");
const join_info = document.getElementById("join_info");
const join = document.getElementById("join");
// ---------- Listeners ------ \\
var srcindex = -1; //srcindex remembers the last index that was inputted when hold was true
var hold = false;
var game;
var role;
//@ts-ignore
var listener = new window.keypress.Listener(); //stop_listening when the game is empty
/**
 * Validates move and sends a request to the server for the corrresponding move
 * @param src The index of the source deck
 * @param dst The index of the destination deck
 */
function sendMoveToServer(src, dst) {
    let delta = game.move(role, src, dst);
    if (delta.valid) {
        //Move listeners
        //1) Checks if the move is valid internally
        //2) Sends move request to server
        socket.emit("send_move", game.getID, role, src, dst, (status) => {
            if (!status) {
                //Fails, add sound effect and card retraction effect
                console.log(`Move from ${src} to ${dst} has failed.`);
            }
        });
    }
}
/**
 * Deceides if the input is a player flipping cards or if it is a player moving cards
 * @param key The key the player pressed
 */
function playerInputControl(key) {
    let newindex = Game.key_to_index(key, role);
    if (hold) {
        if (srcindex === -1) {
            srcindex = newindex;
            return;
        }
        //Prevents the controller retaining a middle deck as a source
        if ((srcindex === CONSTANTS.MID_LEFT || srcindex === CONSTANTS.MID_RIGHT) && (newindex < CONSTANTS.MID_LEFT || newindex > CONSTANTS.MID_RIGHT)) {
            srcindex = newindex;
            return;
        }
        sendMoveToServer(srcindex, newindex);
        srcindex = -1;
    }
    else {
        sendMoveToServer(newindex, newindex);
    }
}
/**
 * Returns the user from a game to the main menu
 */
function backToMenu() {
    modaldiv.style.display = "none";
    gamediv.style.display = "none";
    menudiv.style.display = "flex";
    create_game.style.display = "inline-block";
    game_id.style.display = "none";
    join_info.innerHTML = "";
}
/**
 * Opens a modal box with the message message
 * @param message
 */
function modalMessage(message) {
    modaldiv.style.display = "flex";
    document.getElementById("modal-message").innerText = message;
}
//testing listner
//@ts-ignore
var test_listener = new window.keypress.Listener();
//test_listener.simple_combo("shift", wrapper);
/**
 * Adding listeners to keys
 */
listener.register_combo({
    "keys": "space",
    "on_keydown": (event, combo, autorepeat) => {
        console.log("space_down");
        hold = true;
    },
    "on_keyup": (event, combo, autorepeat) => {
        console.log("space_up");
        hold = false;
    },
    "prevent_repeat": true
});
listener.register_combo({
    "keys": "enter",
    "on_keydown": (event, combo, autorepeat) => {
        console.log("ENTER");
        playerInputControl("ENTER");
    },
    "prevent_repeat": true
});
let valid_keys = ["E", "R", "T", "Y", "U", "I", "D", "F", "G", "H", "J", "K"];
for (let key of valid_keys) {
    listener.simple_combo(key.toLowerCase(), () => {
        console.log(`${key} registered!`);
        playerInputControl(key);
    });
}
listener.stop_listening();
// --------------------------- \\
/**
 * Runs when Create Game is clicked. Requests the server to create a game and prints output on the button
 */
create_game.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("create_game");
    socket.emit("create_game", (response) => {
        if (response.status) {
            game_id.style.display = "block";
            create_game.style.display = "none";
            game_id.innerText = `GameID: ${response.msg}`;
        }
    });
});
/**
 * Requests server to join a game with the givenID
 */
join.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("join!");
    socket.emit("join_game", join_info.value, (response) => {
        console.log(response.status); //placeholder code, the server should start a new game when a player joins
    });
});
/**
 * Returns the user from a game to the main menu
 */
document.getElementById("modal-return").addEventListener("click", (e) => {
    e.preventDefault();
    backToMenu();
});
/**
 * Reponds to the server broadcasting a move.
 */
socket.on("receive_move", (delta) => {
    game.parse(delta, () => {
        if (delta.data.winner === role) {
            modalMessage("You Win!");
        }
        else {
            modalMessage("You Lost!");
        }
    });
    game.printState();
    let gameState = game.getState();
    for (let i = 0; i < 14; i++) {
        updateHTML(i, gameState[i]);
    }
});
// ------------------------------------------ \\
/**
 * Responds to the server broadcasting a new game. Hides the menu, initializes the game and starts the game.
 */
socket.on("start_game", (delta, gameid, assignedRole) => {
    //start_game   ------------------------------ \\
    //Client: Hide menu and show gamediv, receive gamestate, start game internally
    gamediv.style.display = "flex";
    menudiv.style.display = "none";
    role = assignedRole[socket.id];
    game = new Game(gameid);
    game.parse(delta, () => { });
    game.dealHand();
    game.parse({ valid: true, operation: "START", data: { self: true, other: true } }, () => { });
    game.printState();
    let gameState = game.getState();
    for (let i = 0; i < 14; i++) {
        updateHTML(i, gameState[i]);
    }
    //
    listener.listen();
    // ------------------------------------------ \\
});
