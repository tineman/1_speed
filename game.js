import { Deck, printDeck, populate, shuffle, transfer, startDeck } from "./Card.js";
/*
Each game gets a unique room? Or perhaps they broadcast a unique message
*/
class Game {
    /**
     * Sets up a new game.
     * @param identifier The unique identifier attached to this Game
     */
    constructor(identifier) {
        this.identifier = identifier;
        this.decks = [];
        for (let i = 0; i < 6; i++)
            this.decks.push(new Deck("OTHER"));
        for (let i = 0; i < 2; i++)
            this.decks.push(new Deck("MID"));
        for (let i = 0; i < 6; i++)
            this.decks.push(new Deck("SELF"));
        let master = new Deck("Master");
        populate(master);
        shuffle(master);
        for (let i = 0; i < 26; i++) {
            transfer(master, this.decks[5]);
            transfer(master, this.decks[13]);
        }
        startDeck(this.decks[5], this.decks, 0);
        startDeck(this.decks[13], this.decks, 8);
        for (let deck of this.decks) {
            printDeck(deck);
        }
    }
    move() {
        //accept moves. Check if a player has won
    }
    deconstructor() {
    }
}
let game = new Game("ipsum");
//Create a thing with a terminal interface [src] [dst] vs. [print]
