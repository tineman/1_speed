import { updateHTML } from "./animation.js";
import { CONSTANTS } from "./constants.js";
import Game from "./game.js";
import "./keypress.js"

//@ts-ignore
var socket = io();

const gamediv = document.getElementById("game");
const menudiv = document.getElementById("menu");

const txtgamestate = document.getElementById("gamestate");

const create_game = document.getElementById("create_game");
const join_info = <HTMLInputElement>document.getElementById("join_info");
const join = document.getElementById("join");

// ---------- Listeners ------ \\

var srcindex = -1; //srcindex remembers the last index that was inputted when hold was true
var hold = false; 

var game:Game;
var role:string;

//@ts-ignore
var listener = new window.keypress.Listener(); //stop_listening when the game is empty

/**
 * Validates move and sends a request to the server for the corrresponding move
 * @param src The index of the source deck
 * @param dst The index of the destination deck
 */
function sendMoveToServer(src:number, dst:number)
{
    let delta = game.move(role, src, dst);
    if(delta.valid)
    {
        //Move listeners
        //1) Checks if the move is valid internally
        //2) Sends move request to server
        socket.emit("send_move", game.getID, role, src, dst, (status) => {
            if(!status)
            {
                //Fails, add sound effect and card retraction effect
                console.log(`Move from ${src} to ${dst} has failed.`);
            }
            
        });
    }

}

/**
 * Function controlling player-input
 * @param key The key the player pressed
 */
function playerInputControl(key:string)
{

    if(hold)
    {
        if(srcindex === -1) srcindex = Game.key_to_index(key, role);
        else
        {
            sendMoveToServer(srcindex, Game.key_to_index(key, role));
            srcindex = -1;
        }
    }
    else
    {
        let flip_index = Game.key_to_index(key, role);
        sendMoveToServer(flip_index, flip_index);
    }
}

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

for(let key of valid_keys)
{
    listener.simple_combo(key.toLowerCase(), () => {
        console.log(`${key} registered!`);
        playerInputControl(key);
    });
}

listener.stop_listening();

// --------------------------- \\

create_game!.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("create_game");

    socket.emit("create_game", (response) => {
        document.getElementById("response")!.innerText = response.status; //you cant set the innertext if it was originally "", you have to set it to " "
    });
});

join!.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("join!");

    socket.emit("join_game", join_info!.value, (response) => {
        console.log(response.status); //placeholder code, the server should start a new game when a player joins
    });
});

socket.on("receive_move", (delta) => {
    game.parse(delta, () => {console.log("Someone won, we're just not sure who lmao")});
    game.printState();
    
    let gameState = game.getState();
    for(let i = 0; i < 14; i++)
    {
        updateHTML(i, gameState[i]);
    }
    
})

// ------------------------------------------ \\

socket.on("start_game", (delta, gameid, assignedRole) => {

    //start_game   ------------------------------ \\
    //Client: Hide menu and show gamediv, receive gamestate, start game internally
    gamediv!.removeAttribute("hidden");
    menudiv!.setAttribute("hidden", "hidden");

    role = assignedRole[socket.id];

    game = new Game(gameid);
    game.parse(delta, () => {});
    game.dealHand();
    game.parse({valid: true, operation: "START", data: {self: true, other: true}}, () => {});
    game.printState();
    
    let gameState = game.getState();
    for(let i = 0; i < 14; i++)
    {
        updateHTML(i, gameState[i]);
    }

    //

    listener.listen();
    
// ------------------------------------------ \\
});