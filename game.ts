import {Card, isAdjacent, Deck, printDeck, populate, shuffle, transfer, isValid, startDeck} from "./Card.js"

/*
Each game gets a unique room? Or perhaps they broadcast a unique message 
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

    Move, check if it wins

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

    //checkempty - is a player's hand empty?
    //next turn - puts player's hands back into deck, shuffle deck, send new decks to players [later]
    //

    //move also calls a bunch of other functions since this is the update function
    move() //flip card [really just an object with a src and dst index] [or perhaps not ... we need to reconcile the OTHER vs. SELF client vs server]
    {
        //accept moves. Check if a player has won
        
    }

}



let game = new Game("ipsum");

//Create a thing with a terminal interface [src] [dst] vs. [print]