import {Card, isAdjacent, Deck, printDeck, populate, shuffle, transfer, isValid, startDeck} from "./Card.js"

/*
Each game gets a unique room? Or perhaps they broadcast a unique message 
BUG - you can manipulate things that are faceup
NOTE - check moves on clientside before sending them to server first
*/

class Game
{
    identifier:string;

    /* Use the numbers to hit speed/center decks? space + center to claim a final deck?

    OTHER <= location
    [DO] [FO] [GO] [JO] [KO] [DECKO] <= actual variable names


            MID
            [LEFTM] [RIGHTM]


    SELF
    [DS] [FS] [GS] [JS] [KS] [DECKS]

    index = 0   1   2   3   4   5      6      7       8   9   10  11  12  13
    deck = [DO, FO, GO, JO, KO, DECKO, LEFTM, RIGHTN, DS, FS, GS, JS, KS, DECKS]

    Game
    - init
    - move
    - startDeck

    */

    decks:Array<Deck>;
    selfempty:boolean;
    otherempty:boolean;

    /**
     * Sets up a new game.
     * @param identifier The unique identifier attached to this Game
     */
    constructor(identifier:string)
    {

        this.selfempty = false;
        this.otherempty = false;

        this.identifier = identifier;
        this.decks = [];
        for(let i = 0; i < 6; i++) this.decks.push(new Deck("OTHER"));
        for(let i = 0; i < 2; i++) this.decks.push(new Deck("MID"));
        for(let i = 0; i < 6; i++) this.decks.push(new Deck("SELF"));
        
        let master:Deck = new Deck("Master");
        populate(master);
        shuffle(master);

        for(let i = 0; i < 26; i++)
        {
            transfer(master, this.decks[5]);
            transfer(master, this.decks[13]);
            
        }

        startDeck(this.decks[5], this.decks, 0);
        startDeck(this.decks[13], this.decks, 8);
        
    }

    /**
     * Checks if a player's hand is empty and sets the corresponding boolean to true
     */
    handIsEmpty()
    {
        let empty:boolean = true;
        for(let i = 0; i < 5 && empty; i++)
        {
            if(this.decks[i].cards.length != 0) empty = false;
        }
        this.otherempty = empty;

        empty = true;
        for(let i = 0; i < 5 && empty; i++)
        {
            if(this.decks[i + 8].cards.length != 0) empty = false;
        }
        this.selfempty = empty;
    }

    /**
     * Appends all cards from a player's hand to their deck and shuffles
     * @param otherIndex the index of the deck OTHER claims; 6 and 7 for left and right respectively
     * @param selfIndex the index of the deck SELF claims; 6 and 7 for left and right respectively
     */
    returnCards(otherIndex:number, selfIndex:number)
    {
        for(let i = 0; i < 5; i++)
        {
            this.decks[5].cards.push(...this.decks[i].cards);
            this.decks[13].cards.push(...this.decks[i + 8].cards);
            this.decks[i].cards = [];
            this.decks[i + 8].cards = [];
        }

        this.decks[5].cards.push(...this.decks[otherIndex].cards);
        this.decks[13].cards.push(...this.decks[selfIndex].cards);
        this.decks[6].cards = [];
        this.decks[7].cards = [];
    }


    //TODO
    /*
    Unittest
    implement send and receive decks
    implement a terminal test
    home: attach an error listener to teh server and client to print out diagnostics in case of a crash
    */

    /*
    {valid: [bool],
    data: [either a {src, dst} or a deck}
    */

        //or should there be some sort of object parser?

    //Move:
        //Client wants to make a move
        //Client checks isValid()?
        //If so, Client sends a json file with the src and dst using the moveRequest broadcast
        //Server receives a moverequest broadcast
        //Server checks if the move is valid using move() and returns an object
        //Server parses object with parse(), changing the server's state
        //Server broadcasts response to all players if valid, only original player if not
        //Clients parse object with parse()

        //the player should know if they are the SELF or the OTHER


    /**
     * Return an object representing the change the specified move would make to the game. This object is sent
     * to parse() or is sent via socket.io. The only change move() makes to the state of the server is if it shuffles.
     * @param sender either "SELF" or "OTHER"; the player who does the move
     * @param src the index of the source deck
     * @param dst the index of the destination deck
     * @returns an object representing the changes to be made to the gamestate
     */
    move(sender:string, src:number, dst:number) 
    {

        if(isValid(this.decks[src], this.decks[dst]))
        {

            //flipping a card
            if(src == dst && (this.decks[src].location == "SELF" || this.decks[src].location == "OTHER"))
            {
                //this.decks[src].cards[0].faceup = !this.decks[src].cards[0].faceup; //move
                return {valid: true,
                    operation: "FLIP",
                    data: {index: src}
                };
            }
            
            //Claiming a middle deck
            if(src == dst && (this.decks[src].location == "MID"))
            {

                let second_choice_deck;
                if(src == 6) second_choice_deck == 7;
                else second_choice_deck == 6;

                this.handIsEmpty();

                if(sender == "OTHER" && this.otherempty)
                {
                    if(this.decks[5].cards.length == 0)
                    {
                        return {valid: true,
                        operation: "WIN",
                        data: {winner: "OTHER"}}
                    }

                    this.returnCards(src, second_choice_deck);

                    return {valid: true,
                    operation: "SHUFFLE",
                    data: {
                        self: this.decks[13],
                        other: this.decks[5]
                    }};
                    
                }

                if(sender == "SELF" && this.selfempty)
                {
                    if(this.decks[13].cards.length == 0)
                    {
                        return {valid: true,
                        operation: "WIN",
                        data: {winner: "SELF"}}
                    }
                    
                    this.returnCards(second_choice_deck, src);

                    return {valid: true,
                    operation: "SHUFFLE",
                    data: {
                        self: this.decks[13],
                        other: this.decks[5]
                    }};
                }

                return {valid: false};
            }

            //moving your card in your hand
            if (this.decks[src].location == this.decks[dst].location)
            {
                //transfer(this.decks[src], this.decks[dst]); //move
                return {valid: true,
                    operation: "MOVE",
                    data: {src: src, dst: dst}
                };
            }
            
            //Moving a card
            if((this.decks[src].location == "SELF" || this.decks[src].location == "OTHER") && this.decks[dst].location == "MID")
            {
                //transfer(this.decks[src], this.decks[dst]); //move
                return {valid: true,
                    operation: "MOVE",
                    data: {src: src, dst: dst}
                };
            }
        }

        return {valid: false};

    }

    /**
     * Makes changes to the Game state as specified by delta. Assumes delta.valid == true
     * @param win a (void) => void function to be called when a player wins
     * @param delta the object representing the change in gamestate. Assumed to be valid.
     */
    parse(delta:Object, win:Function)
    {
        switch (delta.operation) {
            case "FLIP":
                this.decks[delta.data.index].cards[0].faceup = !this.decks[delta.data.index].cards[0].faceup;
                break;
        
            case "MOVE":
                transfer(this.decks[delta.data.src], this.decks[delta.data.dst]);
                break;

            case "WIN":
                win();
                break;

            case "SHUFFLE":
                this.decks[5] = delta.data.other;
                this.decks[13] = delta.data.self;
                break;

                
        }
    }

    //Prints the state for debugging
    printState()
    {
        let topCard:Array<string> = [];
        for(let deck of this.decks)
        {
            if(deck.cards.length == 0) topCard.push("[EMPTY]");
            else if(!deck.cards[0].faceup) topCard.push("[FACEDOWN]");
            else topCard.push(`[${deck.cards[0].suit} of ${deck.cards[0].rank}]`);
        }

        console.log(`${topCard[0]}, ${topCard[1]}, ${topCard[2]}, ${topCard[3]}, ${topCard[4]} Deck: ${topCard[5]} \n mid: ${topCard[6]}, ${topCard[7]} \n ${topCard[8]}, ${topCard[9]}, ${topCard[10]}, ${topCard[11]}, ${topCard[12]} Deck: ${topCard[13]}`)
    }



    //socket - after a shuffle, the state should be sent back to the players
    

}

let input = document.getElementById("input");
let src = document.getElementById("src");
let dst = document.getElementById("dst");

let game = new Game("strangers to love");
game.printState();

input.addEventListener("submit", function(e){
    e.preventDefault();
    let delta = game.move("SELF", +(src.innerText), +(dst.innerText));
    console.log(delta);
    src.innerText = "";
    dst.innerText = "";
    game.parse(delta, () =>
    {
        console.log("Win!");
    });
    game.printState();
});