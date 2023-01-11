import Game from "./test/public/game.js";
import {Card, isAdjacent, Deck, printDeck, populate, shuffle, transfer, isValid, startDeck} from "./test/public/Card.js"
import {CONSTANTS} from "./test/public/constants.js"

import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

//implement persistent ids later for reconnecting and disconnecting. FOr now, just get something basic implementsed
    //also, using the socket ids directly is likely very insecure
    //also, get a better idea of the number of players

//or: on disconnect, the game pauses and the player can reconnect. When someone is in the middle of a game, disconnects
//and reconnects, the game automatically shuffles. This is because my code is bad and doesn't send gamestates. Rather, it
//sends two out of the fourteen decks, on the assumptmion that that was all that was needed. even though it's not much more efficent...
//let's pretend it's because of "fairness"

// using functions so we can have an interface. In the future, if a more efficient data structure is needed
// the code can be revamped more easily

var games:Array<Game> = [];

/**
 * Return the game requested, if it exists. If not, returns a game with location CONSTANTS.GAMENOTFOUND
 * @param gameName The name of the game to be found
 */
function findGame(gameName:string)
{
    for(let i = 0; i < games.length; i++)
    {
        if(games[i].getID === gameName) return games[i];
    }
    
    return new Game(CONSTANTS.GAMENOTFOUND); //to make typing match
}

/**
 * Creates a new game using the name of the player as an identifier
 * @param gameName The name of the host or SELF creating the game
 */
function addGame(gameName:string)
{
    games.push(new Game(gameName));
}

/**
 * Allows a player to join a game. Returns if the user was able to join or not.
 * @param gameName The name of the game to be joined
 * @param playerName The name of the player
 */
function joinGame(gameName:string, playerName:string)
{
    for(let i = 0; i < games.length; i++)
    {
        if(games[i].getID === gameName)
        {
            if(!games[i].getOther)
            {
                games[i].setOther = playerName;
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}

/**
 * Deletes a game
 * @param gameName The name of the game to be deleted
 */
function deleteGame(gameName:string)
{
    for(let i = 0; i < games.length; i++)
    {
        if(games[i].getID === gameName) games.splice(i, 1);
    }
}

// -------- \\

/**
 * Remove the socket from all rooms except their own
 * @param socket 
 */
function deleteRooms(socket:Socket)
{
    for(let room of socket.rooms)
    {
        if(room !== socket.id) socket.leave(room);
    }
}

// -------- \\

app.use("/test", express.static(`${__dirname}/test`));
app.use(express.static(`${__dirname}/test/public`)); 

//on disconnect, delete a game, send a disconnect message and delete its room

io.on("connection", (socket) => { //when joining or creating a game, they should be taken out of every other socketio room
    console.log(`User with socket id ${socket.id} just connected!`);
    console.log(games);

    socket.on("create_game", (callback) => {

        if(findGame(socket.id).getID === CONSTANTS.GAMENOTFOUND)
        {

            // ------------------------------------------ \\

            //Disconnect them from all other rooms
            deleteRooms(socket);
            //connect them to this room (redundant, they are already in their own room)
            
            addGame(socket.id);
            callback({status: `Created game with ID ${socket.id}. Waiting for an opponent...`});

            // ------------------------------------------ \\

        }
        else
        {

            // ------------------------------------------ \\

            callback({status: `Game with ID ${socket.id} already exists`});

            // ------------------------------------------ \\
        }
    });

    socket.on("join_game", (gameid:string, callback) => {
        if(joinGame(gameid, socket.id))
        {

            // ------------------------------------------ \\

            //Disconnect them from all other rooms
            deleteRooms(socket);
            //connect them to this room 
            socket.join(gameid);
            
            // ------------------------------------------ \\
            
            let game = findGame(gameid);
            if(game.getID === CONSTANTS.GAMENOTFOUND)
            {
                //deal with error
            }

            //start_game  ------------------------------ \\
            //Server: Transmit gamestate to client, then start the game internally

            let delta = game.move(CONSTANTS.SELF, 6, 6);
            game.parse(delta, () => {}); //parse and then emit
            let roles = JSON.parse(`{"${game.getSelf}":"${CONSTANTS.SELF}", "${game.getOther}":"${CONSTANTS.OTHER}"}`)
            io.to(gameid).emit("start_game", delta, gameid, roles); //put some of this in a function
            game.setPause = false;
            game.dealHand();
            game.parse({valid: true, operation: "START"}, () => {});

            // ------------------------------------------ \\

            game.printAll();
            callback({status: `Joined game!`});
        }
        else
        {
            callback({status: `failed to join game!`});
        }
    });

    socket.on("send_move", (gameID, sender, src, dst, callback) => {
        let game = findGame(gameID);
        if(game.getID === CONSTANTS.GAMENOTFOUND)
        {
            //error handling
        }

        let delta = game.move(sender, src, dst);
        if(delta.valid)
        {
            game.parse(delta, () => {console.log(`Winner in game ${gameID}`)});
            io.to(gameID).emit("receive_move", delta);
            callback(true);
        }
        else
        {
            callback(false);
        }

    });

    socket.on("move", (gameid:string, src:number, dst:number) => {
        //call move on the given game
        //
    });
});

httpServer.listen(3000, () => {
    console.log('listening on *:3000');
});