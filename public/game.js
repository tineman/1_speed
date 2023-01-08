import { Deck, printDeck, populate, shuffle, transfer, isValid, startDeck } from "./Card.js";
import { CONSTANTS } from "./constants.js";
export default class Game {
    /**
     * Sets up a new game.
     * @param identifier The unique identifier attached to this Game
     */
    constructor(identifier) {
        this.selfempty = false;
        this.otherempty = false;
        this.pause = true;
        this.self_id = identifier;
        this.other_id = "";
        this.identifier = identifier;
        this.decks = [];
        for (let i = 0; i < 6; i++)
            this.decks.push(new Deck(CONSTANTS.OTHER));
        for (let i = 0; i < 2; i++)
            this.decks.push(new Deck(CONSTANTS.MID));
        for (let i = 0; i < 6; i++)
            this.decks.push(new Deck(CONSTANTS.SELF));
        let master = new Deck("Master");
        populate(master);
        shuffle(master);
        for (let i = 0; i < 26; i++) {
            transfer(master, this.decks[CONSTANTS.OTHER_DECK]);
            transfer(master, this.decks[CONSTANTS.SELF_DECK]);
        }
    }
    get getID() {
        return this.identifier;
    }
    get getSelf() {
        return this.self_id;
    }
    set setSelf(self_id) {
        this.self_id = self_id;
    }
    get getOther() {
        return this.other_id;
    }
    set setOther(other_id) {
        this.other_id = other_id;
    }
    get getPause() {
        return this.pause;
    }
    set setPause(pause) {
        this.pause = pause;
    }
    /**
     * Deals cards from each player's decks to their hands. Called before parse({valid: true, operation:"start"}))
     */
    dealHand() {
        startDeck(this.decks[CONSTANTS.OTHER_DECK], this.decks, CONSTANTS.OTHER_D);
        startDeck(this.decks[CONSTANTS.SELF_DECK], this.decks, CONSTANTS.SELF_D);
    }
    //FOR THE BEGINNING DELTA, YOU CAN CALL MOVE ON A NEWLY INITIALISED DECK
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
            this.decks[CONSTANTS.OTHER_DECK].cards.push(...this.decks[i].cards);
            this.decks[CONSTANTS.SELF_DECK].cards.push(...this.decks[i + 8].cards);
            this.decks[i].cards = [];
            this.decks[i + 8].cards = [];
        }
        this.decks[CONSTANTS.OTHER_DECK].cards.push(...this.decks[otherIndex].cards);
        this.decks[CONSTANTS.SELF_DECK].cards.push(...this.decks[selfIndex].cards);
        this.decks[CONSTANTS.MID_LEFT].cards = [];
        this.decks[CONSTANTS.MID_RIGHT].cards = [];
        shuffle(this.decks[CONSTANTS.OTHER_DECK]);
        shuffle(this.decks[CONSTANTS.SELF_DECK]);
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
     * @param sender either CONSTANTS.SELF or CONSTANTS.OTHER; the player who does the move
     * @param src the index of the source deck
     * @param dst the index of the destination deck
     * @returns an object representing the changes to be made to the gamestate
     */
    move(sender, src, dst) {
        //No touching the opponent's hand!
        if (sender == CONSTANTS.SELF && src < CONSTANTS.MID_LEFT)
            return { valid: false };
        if (sender == CONSTANTS.OTHER && src > CONSTANTS.MID_RIGHT)
            return { valid: false };
        //No touching your deck!
        if (src === CONSTANTS.OTHER_DECK || src === CONSTANTS.SELF_DECK || dst === CONSTANTS.OTHER_DECK || dst === CONSTANTS.SELF_DECK)
            return { valid: false };
        if (isValid(this.decks[src], this.decks[dst])) {
            //flipping a card
            if (src == dst && (this.decks[src].location == CONSTANTS.SELF || this.decks[src].location == CONSTANTS.OTHER)) {
                //this.decks[src].cards[0].faceup = !this.decks[src].cards[0].faceup; //move
                return { valid: true,
                    operation: "FLIP",
                    data: { index: src }
                };
            }
            //Claiming a middle deck
            if (src == dst && (this.decks[src].location == CONSTANTS.MID)) {
                var second_choice_deck;
                if (src == CONSTANTS.MID_LEFT)
                    second_choice_deck = CONSTANTS.MID_RIGHT;
                else
                    second_choice_deck = CONSTANTS.MID_LEFT;
                this.handIsEmpty();
                if (sender == CONSTANTS.OTHER && this.otherempty) {
                    if (this.decks[CONSTANTS.OTHER_DECK].cards.length == 0) {
                        return { valid: true,
                            operation: "WIN",
                            data: { winner: CONSTANTS.OTHER } };
                    }
                    return { valid: true,
                        operation: "SHUFFLE",
                        data: {
                            full: false,
                            self: second_choice_deck,
                            other: src
                        } };
                }
                if (sender == CONSTANTS.SELF && this.selfempty) {
                    if (this.decks[CONSTANTS.SELF_DECK].cards.length == 0) {
                        return { valid: true,
                            operation: "WIN",
                            data: { winner: CONSTANTS.SELF } };
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
            if ((this.decks[src].location == CONSTANTS.SELF || this.decks[src].location == CONSTANTS.OTHER) && this.decks[dst].location == CONSTANTS.MID) {
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
                    this.decks[CONSTANTS.OTHER_DECK] = delta.data.other;
                    this.decks[CONSTANTS.SELF_DECK] = delta.data.self;
                }
                else {
                    delta.data.full = true;
                    this.returnCards(delta.data.other, delta.data.self);
                    delta.data.other = this.decks[CONSTANTS.OTHER_DECK];
                    delta.data.self = this.decks[CONSTANTS.SELF_DECK];
                }
                break;
            case "START": //this is sent manually
                if (this.decks[CONSTANTS.OTHER_DECK].cards.length == 0 && this.decks[CONSTANTS.SELF_DECK].cards.length == 0) {
                    //When neither side can make a move
                    this.returnCards(CONSTANTS.MID_LEFT, CONSTANTS.MID_RIGHT);
                    delta = { valid: true,
                        operation: "SHUFFLE",
                        data: {
                            full: true,
                            self: this.decks[CONSTANTS.SELF_DECK],
                            other: this.decks[CONSTANTS.OTHER_DECK]
                        } };
                }
                if (this.decks[CONSTANTS.OTHER_DECK].cards.length != 0) {
                    transfer(this.decks[CONSTANTS.OTHER_DECK], this.decks[CONSTANTS.MID_LEFT]);
                    this.decks[CONSTANTS.MID_LEFT].cards[0].faceup = true;
                }
                if (this.decks[CONSTANTS.SELF_DECK].cards.length != 0) {
                    transfer(this.decks[CONSTANTS.SELF_DECK], this.decks[CONSTANTS.MID_RIGHT]);
                    this.decks[CONSTANTS.MID_RIGHT].cards[0].faceup = true;
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
    //return a string to display prinState() for HTML
    printStateHTML() {
        let topCard = [];
        for (let deck of this.decks) {
            if (deck.cards.length == 0)
                topCard.push("[EMPTY]");
            else if (!deck.cards[0].faceup)
                topCard.push("[FACEDOWN]");
            else
                topCard.push(`[${deck.cards[0].rank} of ${deck.cards[0].suit}]`);
        }
        return (`OTHER: ${topCard[0]}, ${topCard[1]}, ${topCard[2]}, ${topCard[3]}, ${topCard[4]} Deck: ${topCard[5]} \n\n\nMID: ${topCard[6]}, ${topCard[7]} \n\n\nSELF: ${topCard[8]}, ${topCard[9]}, ${topCard[10]}, ${topCard[11]}, ${topCard[12]} Deck: ${topCard[13]}`);
    }
    //Prints the contents of all the cards for debugging
    printAll() {
        for (let deck of this.decks) {
            printDeck(deck);
        }
    }
}
//Terminal game
/*
let input = document.getElementById("input");

let game = new Game("strangers to love");
game.dealHand();
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
/*
//Testing

console.log("Starting all tests!");

let game = new Game("we're no strangers to love");
game.dealHand();

//handisempty()

game.handIsEmpty();

if(game.selfempty || game.otherempty) console.log("fail1");

game.returnCards(6, 7);
game.decks[CONSTANTS.OTHER_DECK] = new Deck(CONSTANTS.OTHER);
game.decks[CONSTANTS.SELF_DECK] = new Deck(CONSTANTS.SELF);

game.handIsEmpty();
if(!game.selfempty || !game.otherempty) console.log("fail2");


//- returncards()
  //  - all other decks are empty
  //  - all cards are facedown

game = new Game("You know the rules, and so do I");
game.decks[0].cards[0].faceup = true;
game.returnCards(6, 7);

for(let i = 0; i < 14; i++)
{
    if(i != 5 && i != 13)
    {
        if(game.decks[i].cards.length != 0) console.log("fail3");
    }
}

for(let i = 0; i < 14; i++)
{
    for(let card of game.decks[i].cards)
    {
        if(card.faceup) console.log("fail4");
    }
}

//move()

let newGame = new Game("we've been together for so long");
newGame.dealHand();
newGame.returnCards(6, 7);

//clearing all decks
newGame.decks[6] = new Deck(CONSTANTS.MID);
newGame.decks[7] = new Deck(CONSTANTS.MID);

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

//claim middle 6 -> 6 VALID, check shuffle - SHUFFLE MAY BE INVALID? THE DELTA SHOULD HAVE A FULL = FALSE BUT HERE FULL = TRUE?

let input = document.getElementById("input");

newGame.printState();

input!.addEventListener("submit", function(e){
    e.preventDefault();
    let src = <HTMLInputElement>document.getElementById("src");
    let dst = <HTMLInputElement>document.getElementById("dst");

    console.log(`Moving from deck ${src!.value} to deck ${(dst!.value)}`); //! to note variable can be null (use if you know it wont be but want to cut down on false positive ts errors)
    let delta = newGame.move("OTHER", parseInt(src!.value), parseInt(dst!.value));

    console.log(delta);
    src!.value = "";
    dst!.value = "";
    newGame.parse(delta, () =>
    {
        console.log("Win!");
    });
    newGame.printState();
});
*/ 