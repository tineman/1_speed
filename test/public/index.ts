import { updateFlash, updateHTML, updateSelect } from "./animation.js";
import { isValid } from "./card.js";
import { CONSTANTS } from "./constants.js";
import Game from "./game.js";
import "./keypress.js"

//@ts-ignore
var socket = io();

const modaldiv = document.getElementById("modal");
const gamediv = document.getElementById("game");
const menudiv = document.getElementById("menu");

const create_game = document.getElementById("create_game");
const game_id = document.getElementById("game-id");
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
 * Deceides if the input is a player flipping cards or if it is a player moving cards
 * Also contains quality of life improvements
 * @param key The key the player pressed
 */
function playerInputControl(key:string)
{
    let newindex = Game.key_to_index(key, role)

    if(hold)
    {
        //prevents the user from making a move with no source
        if(srcindex === -1)
        {
            srcindex = newindex;
            update(null, srcindex);
            return;
        }

        //Prevents the controller from using a middle deck as a source
        if((srcindex === CONSTANTS.MID_LEFT || srcindex === CONSTANTS.MID_RIGHT) && (newindex < CONSTANTS.MID_LEFT || newindex > CONSTANTS.MID_RIGHT))
        {
            srcindex = newindex;
            update(null, srcindex);
            return;
        }

        let delta = game.move(role, srcindex, newindex)
        //If the player is going to make an invalid move, change the source instead
        if(!(delta.valid))
        {
            srcindex = newindex;
            update(null, srcindex);
            return;
        }

        //prevents the player from flipping a card when holding space
        if(delta.operation === "FLIP")
        {
            srcindex = -1;
            update(null, srcindex);
            return;
        }

        sendMoveToServer(srcindex, newindex);
        srcindex = -1;
        update(null, srcindex);

    }
    else
    {
        sendMoveToServer(newindex, newindex);
    }
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
        hold = true;
    },
    "on_keyup": (event, combo, autorepeat) => {
        srcindex = -1;
        update(null, srcindex);
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

    listener.register_combo({
        "keys": key.toLowerCase(),
        "on_keydown": (event, combo, autorepeat) => {
            playerInputControl(key);
        },
        
        "prevent_repeat": true
    });

}

listener.stop_listening();

// --------------------------- \\

/**
 * Returns the user from a game to the main menu
 */
function backToMenu()
{
    modaldiv!.style.display = "none";
    gamediv!.style.display = "none";
    menudiv!.style.display = "flex";
    create_game!.style.display = "inline-block";
    game_id!.style.display = "none";
    join_info!.innerHTML = "";
}

/**
 * Opens a modal box with the message message
 * @param message 
 */
function modalMessage(message:string)
{
    modaldiv!.style.display = "flex";
    document.getElementById("modal-message")!.innerText = message;
}

// --------------------------- \\

/**
 * Wrapper function to update HTML
 */
function update(delta = null, index = -1)
{

    //Update the margin.
    let indicies = [index]
    if(game.getOtherWant) indicies.push(5)
    else indicies.push(-1);

    if(game.getSelfWant) indicies.push(13);
    else indicies.push(-1);
    
    updateSelect(indicies, role)

    //update html

    updateHTML(game.getState(), role);

    //update flashes (if needed)

    updateFlash(delta, role);
}

// --------------------------- \\
/**
 * Runs when Create Game is clicked. Requests the server to create a game and prints output on the button
 */
create_game!.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("create_game");

    socket.emit("create_game", (response) => {
        if(response.status)
        {
            game_id!.style.display = "block";
            create_game!.style.display = "none";
            game_id!.innerText = `GameID: ${response.msg}`;
        }
    });
});

/**
 * Requests server to join a game with the givenID
 */
join!.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("join!");

    socket.emit("join_game", join_info!.value, (response) => {
        console.log(response.status); //placeholder code, the server should start a new game when a player joins
    });
});

/**
 * Returns the user from a game to the main menu
 */
document.getElementById("modal-return")!.addEventListener("click", (e) => {
    e.preventDefault();
    backToMenu();
});


/**
 * Reponds to the server broadcasting a move.
 */
socket.on("receive_move", (delta) => {
    game.parse(delta, () => {
        if(delta.data.winner === role)
        {
            modalMessage("You Win!");
        }
        else
        {
            modalMessage("You Lost!");
        }
    });
    game.printState();
    
    update(delta);
    
})

// ------------------------------------------ \\

/**
 * Responds to the server broadcasting a new game. Hides the menu, initializes the game and starts the game.
 */
socket.on("start_game", (delta, gameid, assignedRole) => {

    //start_game   ------------------------------ \\
    //Client: Hide menu and show gamediv, receive gamestate, start game internally

    gamediv!.style.display = "block";
    menudiv!.style.display = "none";

    role = assignedRole[socket.id];

    game = new Game(gameid);
    game.parse(delta, () => {});
    game.parse({valid: true, operation: "START", data: {self: true, other: true}}, () => {});
    game.printState();
    
    update();

    //

    listener.listen();
    
// ------------------------------------------ \\
});