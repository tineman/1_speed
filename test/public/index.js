import { CONSTANTS } from "./constants.js";
import Game from "./game.js";
import "./keypress.js";
var socket = io();
const gamediv = document.getElementById("game");
const menudiv = document.getElementById("menu");
const input = document.getElementById("input");
const src = document.getElementById("src");
const dst = document.getElementById("dst");
const txtgamestate = document.getElementById("gamestate");
const create_game = document.getElementById("create_game");
const join_info = document.getElementById("join_info");
const join = document.getElementById("join");
// ---------- Listeners ------ \\
var srcindex = -1; //srcindex remembers the last index that was inputted when hold was true
var hold = false; //
var game;
var role;
var listener = new window.keypress.Listener();
listener.simple_combo("shift s", () => {
    console.log("You pressed shift and s");
});
/**
 * Return the index of the array the key refers to while accounting for the player's role.
 * Returns -1 whne called with an invalid key
 * @param key The character sent by the listener
 * @returns the index of the array the key refers to while accounting for the player's role
 */
function key_to_index(key) {
    if (key === "E" || key === "R" || key === "T")
        return CONSTANTS.MID_LEFT;
    if (key === "Y" || key === "U" || key === "I")
        return CONSTANTS.MID_RIGHT;
    if (role === CONSTANTS.OTHER) {
        switch (key) {
            case "D":
                return CONSTANTS.OTHER_D;
            case "F":
                return CONSTANTS.OTHER_F;
            case "G":
                return CONSTANTS.OTHER_G;
            case "H":
                return CONSTANTS.OTHER_G;
            case "J":
                return CONSTANTS.OTHER_J;
            case "K":
                return CONSTANTS.OTHER_K;
        }
    }
    if (role === CONSTANTS.SELF) {
        switch (key) {
            case "D":
                return CONSTANTS.SELF_D;
            case "F":
                return CONSTANTS.SELF_F;
            case "G":
                return CONSTANTS.SELF_G;
            case "H":
                return CONSTANTS.SELF_G;
            case "J":
                return CONSTANTS.SELF_J;
            case "K":
                return CONSTANTS.SELF_K;
        }
    }
    return -1;
}
// --------------------------- \\
create_game.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("create_game");
    socket.emit("create_game", (response) => {
        document.getElementById("response").innerText = response.status; //you cant set the innertext if it was originally "", you have to set it to " "
    });
});
join.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("join!");
    socket.emit("join_game", join_info.value, (response) => {
        console.log(response.status); //placeholder code, the server should start a new game when a player joins
    });
});
//Move listeners
//1) Checks if the move is valid internally
//2) Sends move request to server
input.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("input");
    let srcDeck = parseInt(src.value);
    let dstDeck = parseInt(dst.value);
    let delta = game.move(role, srcDeck, dstDeck);
    if (delta.valid) {
        socket.emit("send_move", game.getID, role, srcDeck, dstDeck, (status) => {
            if (!status) {
                //Fails, add sound effect and card retraction effect
                console.log(`Move from ${srcDeck} to ${dstDeck} has failed.`);
            }
        });
    }
});
socket.on("receive_move", (delta) => {
    game.parse(delta, () => { console.log("Someone won, we're just not sure who lmao"); });
    game.printState();
    txtgamestate.innerText = `Role: ${role}\n` + game.printStateHTML();
});
// ------------------------------------------ \\
socket.on("start_game", (delta, gameid, assignedRole) => {
    //start_game   ------------------------------ \\
    //Client: Hide menu and show gamediv, receive gamestate, start game internally
    gamediv.removeAttribute("hidden");
    menudiv.setAttribute("hidden", "hidden");
    role = assignedRole[socket.id];
    game = new Game(gameid);
    game.parse(delta, () => { });
    game.dealHand();
    game.parse({ valid: true, operation: "START" }, () => { });
    game.printState();
    txtgamestate.innerText = `Role: ${role}\n` + game.printStateHTML();
    // ------------------------------------------ \\
});
export { key_to_index };