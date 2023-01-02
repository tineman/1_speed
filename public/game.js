import { Card, Deck, populate, shuffle, transfer, isValid, startDeck } from "./Card.js";
class Game {
    /**
     * Sets up a new game.
     * @param identifier The unique identifier attached to this Game
     */
    constructor(identifier) {
        this.selfempty = false;
        this.otherempty = false;
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
    }
    /**
     * Checks if a player's hand is empty and sets the corresponding boolean to true
     */
    handIsEmpty() {
        let empty = true;
        for (let i = 0; i < 5 && empty; i++) {
            if (this.decks[i].cards.length != 0)
                empty = false;
        }
        this.otherempty = empty;
        empty = true;
        for (let i = 0; i < 5 && empty; i++) {
            if (this.decks[i + 8].cards.length != 0)
                empty = false;
        }
        this.selfempty = empty;
    }
    /**
     * Appends all cards from a player's hand to their deck and shuffles
     * @param otherIndex the index of the deck OTHER claims; 6 and 7 for left and right respectively
     * @param selfIndex the index of the deck SELF claims; 6 and 7 for left and right respectively
     */
    returnCards(otherIndex, selfIndex) {
        for (let i = 0; i < 5; i++) {
            this.decks[5].cards.push(...this.decks[i].cards);
            this.decks[13].cards.push(...this.decks[i + 8].cards);
            this.decks[i].cards = [];
            this.decks[i + 8].cards = [];
        }
        this.decks[5].cards.push(...this.decks[otherIndex].cards);
        this.decks[13].cards.push(...this.decks[selfIndex].cards);
        this.decks[6].cards = [];
        this.decks[7].cards = [];
        shuffle(this.decks[5]);
        shuffle(this.decks[13]);
    }
    //Move:
    //Client wants to make a move
    //Client checks isValid()?
    //If so, Client sends a json file with the src and dst using the moveRequest broadcast
    //Server receives a moverequest broadcast
    //Server checks if the move is valid using move() and returns a delta
    //Server parses delta with parse(), changing the server's state
    //Server broadcasts response to all players if valid, only original player if not
    //Clients parse delta with parse()
    //the player should know if they are the SELF or the OTHER
    /**
     * Return an object representing the change the specified move would make to the game. This object is sent
     * to parse() or is sent to the client via socket.io.
     * @param sender either "SELF" or "OTHER"; the player who does the move
     * @param src the index of the source deck
     * @param dst the index of the destination deck
     * @returns an object representing the changes to be made to the gamestate
     */
    move(sender, src, dst) {
        //No touching the opponent's decks!
        if (sender == "SELF" && src < 6)
            return false;
        if (sender == "OTHER" && src > 7)
            return false;
        if (isValid(this.decks[src], this.decks[dst])) {
            //flipping a card
            if (src == dst && (this.decks[src].location == "SELF" || this.decks[src].location == "OTHER")) {
                //this.decks[src].cards[0].faceup = !this.decks[src].cards[0].faceup; //move
                return { valid: true,
                    operation: "FLIP",
                    data: { index: src }
                };
            }
            //Claiming a middle deck
            if (src == dst && (this.decks[src].location == "MID")) {
                var second_choice_deck;
                if (src == 6)
                    second_choice_deck = 7;
                else
                    second_choice_deck = 6;
                this.handIsEmpty();
                if (sender == "OTHER" && this.otherempty) {
                    if (this.decks[5].cards.length == 0) {
                        return { valid: true,
                            operation: "WIN",
                            data: { winner: "OTHER" } };
                    }
                    return { valid: true,
                        operation: "SHUFFLE",
                        data: {
                            full: false,
                            self: second_choice_deck,
                            other: src
                        } };
                }
                if (sender == "SELF" && this.selfempty) {
                    if (this.decks[13].cards.length == 0) {
                        return { valid: true,
                            operation: "WIN",
                            data: { winner: "SELF" } };
                    }
                    return { valid: true,
                        operation: "SHUFFLE",
                        data: {
                            full: false,
                            self: src,
                            other: second_choice_deck
                        } };
                }
                return { valid: false };
            }
            //moving your card in your hand
            if (this.decks[src].location == this.decks[dst].location) {
                //transfer(this.decks[src], this.decks[dst]); //move
                return { valid: true,
                    operation: "MOVE",
                    data: { src: src, dst: dst }
                };
            }
            //Moving a card
            if ((this.decks[src].location == "SELF" || this.decks[src].location == "OTHER") && this.decks[dst].location == "MID") {
                //transfer(this.decks[src], this.decks[dst]); //move
                return { valid: true,
                    operation: "MOVE",
                    data: { src: src, dst: dst }
                };
            }
        }
        return { valid: false };
    }
    /**
     * Makes changes to the Game state as specified by delta. Assumes delta.valid == true.
     * When this is run on the server, it modifies the delta and the server-state. The new delta will eb sent to the client.
     * When run on the client, it updates the client-state
     * @param win a (void) => void function to be called when a player wins
     * @param delta the object representing the change in gamestate. Assumed to be valid.
     */
    parse(delta, win) {
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
                if (delta.data.full) {
                    this.decks[5] = delta.data.other;
                    this.decks[13] = delta.data.self;
                }
                else {
                    delta.data.full = true;
                    this.returnCards(delta.data.other, delta.data.self);
                    delta.data.other = this.decks[5];
                    delta.data.self = this.decks[13];
                }
                break;
            case "START":
                if (this.decks[5].cards.length == 0 && this.decks[13].cards.length == 0) {
                    //When neither side can make a move
                    this.returnCards(6, 7);
                    delta = { valid: true,
                        operation: "SHUFFLE",
                        data: {
                            full: true,
                            self: this.decks[13],
                            other: this.decks[5]
                        } };
                }
                if (this.decks[5].cards.length != 0) {
                    transfer(this.decks[5], this.decks[6]);
                    this.decks[6].cards[0].faceup = true;
                }
                if (this.decks[13].cards.length != 0) {
                    transfer(this.decks[13], this.decks[7]);
                    this.decks[7].cards[0].faceup = true;
                }
                break;
        }
    }
    //Prints the state for debugging
    printState() {
        let topCard = [];
        for (let deck of this.decks) {
            if (deck.cards.length == 0)
                topCard.push("[EMPTY]");
            else if (!deck.cards[0].faceup)
                topCard.push("[FACEDOWN]");
            else
                topCard.push(`[${deck.cards[0].rank} of ${deck.cards[0].suit}]`);
        }
        console.log(`${topCard[0]}, ${topCard[1]}, ${topCard[2]}, ${topCard[3]}, ${topCard[4]} Deck: ${topCard[5]} \n mid: ${topCard[6]}, ${topCard[7]} \n ${topCard[8]}, ${topCard[9]}, ${topCard[10]}, ${topCard[11]}, ${topCard[12]} Deck: ${topCard[13]}`);
    }
}
//Terminal game
/*
let input = document.getElementById("input");

let game = new Game("strangers to love");
game.printState();

input.addEventListener("submit", function(e){
    e.preventDefault();
    let src = document.getElementById("src");
    let dst = document.getElementById("dst");

    console.log(`Moving from deck ${src.value} to deck ${(dst.value)}`);
    let delta = game.move("SELF", parseInt(src.value), parseInt(dst.value));

    console.log(delta);
    src.value = "";
    dst.value = "";
    game.parse(delta, () =>
    {
        console.log("Win!");
    });
    game.printState();
});
*/
//Testing
console.log("Starting all tests!");
let game = new Game("we're no strangers to love");
//handisempty()
game.handIsEmpty();
if (game.selfempty || game.otherempty)
    console.log("fail1");
game.returnCards(6, 7);
game.decks[5] = new Deck("OTHER");
game.decks[13] = new Deck("SELF");
game.handIsEmpty();
if (!game.selfempty || !game.otherempty)
    console.log("fail2");
//- returncards()
//  - all other decks are empty
//  - all cards are facedown
game = new Game("You know the rules, and so do I");
game.decks[0].cards[0].faceup = true;
game.returnCards(6, 7);
for (let i = 0; i < 14; i++) {
    if (i != 5 && i != 13) {
        if (game.decks[i].cards.length != 0)
            console.log("fail3");
    }
}
for (let i = 0; i < 14; i++) {
    for (let card of game.decks[i].cards) {
        if (card.faceup)
            console.log("fail4");
    }
}
//move()
let newGame = new Game("we've been together for so long");
newGame.returnCards(6, 7);
//clearing all decks
newGame.decks[6] = new Deck("MID");
newGame.decks[7] = new Deck("MID");
newGame.decks[0].cards.push(new Card(2, 1));
newGame.decks[1].cards.push(new Card(2, 2));
newGame.decks[2].cards.push(new Card(3, 1));
newGame.decks[6].cards.push(new Card(3, 2));
newGame.decks[6].cards[0].faceup = true;
newGame.decks[8].cards.push(new Card(3, 3));
newGame.decks[8].cards[0].faceup = true;
//note: move to self while one of self's decks is empty should be valid
//terminate testing after an unexpected result
//self to self 0 -> 1 VALID
//self to empty self 1 -> 0 VALID
//self to self 0 -> 2 INVALID
//self to mid 0 -> 6 VALID
//self to mid 1 -> 6 INVALID
//claim middle 6 -> 6 VALID, check shuffle
let input = document.getElementById("input");
newGame.printState();
input.addEventListener("submit", function (e) {
    e.preventDefault();
    let src = document.getElementById("src");
    let dst = document.getElementById("dst");
    console.log(`Moving from deck ${src.value} to deck ${(dst.value)}`);
    let delta = newGame.move("OTHER", parseInt(src.value), parseInt(dst.value));
    console.log(delta);
    src.value = "";
    dst.value = "";
    newGame.parse(delta, () => {
        console.log("Win!");
    });
    newGame.printState();
});
