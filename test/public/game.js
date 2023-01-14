import { Deck, printDeck, populate, shuffle, transfer, isValid, startDeck } from "./card.js";
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
        this.selfWantNew = false;
        this.otherWantNew = false;
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
        shuffle(master); //revamp shuffle algorithm for better randomness
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
    get getOtherWant() {
        return this.otherWantNew;
    }
    set setOtherWant(want) {
        this.otherWantNew = want;
    }
    get getSelfWant() {
        return this.selfWantNew;
    }
    set setSelfWant(want) {
        this.selfWantNew = want;
    }
    /**
     * Deals cards from each player's decks to their hands. Called before parse({valid: true, operation:"start"}))
     */
    dealHand() {
        startDeck(this.decks[CONSTANTS.OTHER_DECK], this.decks, CONSTANTS.OTHER_D);
        startDeck(this.decks[CONSTANTS.SELF_DECK], this.decks, CONSTANTS.SELF_D);
    }
    /**
     * Checks if a player's hand is empty and sets the corresponding boolean accordingly
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
        //if(src === CONSTANTS.OTHER_DECK || src === CONSTANTS.SELF_DECK || dst === CONSTANTS.OTHER_DECK || dst === CONSTANTS.SELF_DECK) return { valid: false };
        if (isValid(this.decks[src], this.decks[dst])) {
            //Requesting a switch of the middle card
            if ((src === dst) && ((src === CONSTANTS.SELF_DECK) || (src === CONSTANTS.OTHER_DECK))) {
                if (sender === CONSTANTS.SELF) {
                    return { valid: true,
                        operation: "START",
                        data: {
                            self: !this.getSelfWant,
                            other: this.getOtherWant
                        } };
                }
                else {
                    return { valid: true,
                        operation: "START",
                        data: {
                            self: this.getSelfWant,
                            other: !this.getOtherWant
                        } };
                }
            }
            //Claiming a middle deck
            if (src == dst && (this.decks[src].location == CONSTANTS.MID)) {
                var second_choice_deck;
                if (src == CONSTANTS.MID_LEFT)
                    second_choice_deck = CONSTANTS.MID_RIGHT;
                else
                    second_choice_deck = CONSTANTS.MID_LEFT;
                this.handIsEmpty();
                if ((sender === CONSTANTS.OTHER) && this.otherempty) {
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
                if ((sender === CONSTANTS.SELF) && this.selfempty) {
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
            if (this.decks[src].cards.length == 0)
                return { valid: false };
            //flipping a card
            if (src == dst && (this.decks[src].location == CONSTANTS.SELF || this.decks[src].location == CONSTANTS.OTHER)) {
                return { valid: true,
                    operation: "FLIP",
                    data: { index: src }
                };
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
        if (!delta.valid)
            console.log(`Invalid delta\n ${delta}`);
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
                this.selfWantNew = false;
                this.otherWantNew = false;
                if (delta.data.full) {
                    this.returnCards(CONSTANTS.MID_RIGHT, CONSTANTS.MID_LEFT);
                    this.decks[CONSTANTS.OTHER_DECK] = delta.data.other;
                    this.decks[CONSTANTS.SELF_DECK] = delta.data.self;
                    this.dealHand();
                }
                else {
                    delta.data.full = true;
                    this.returnCards(delta.data.other, delta.data.self);
                    delta.data.other = this.decks[CONSTANTS.OTHER_DECK];
                    delta.data.self = this.decks[CONSTANTS.SELF_DECK];
                    this.dealHand();
                }
                break;
            case "START":
                if (delta.data.self && delta.data.other) {
                    this.selfWantNew = false;
                    this.otherWantNew = false;
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
                else {
                    this.selfWantNew = delta.data.self;
                    this.otherWantNew = delta.data.other;
                }
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
        console.log(`${topCard[0]}, ${topCard[1]}, ${topCard[2]}, ${topCard[3]}, ${topCard[4]} Deck: ${topCard[5]} Flip: ${this.otherWantNew} \n mid: ${topCard[6]}, ${topCard[7]} \n ${topCard[8]}, ${topCard[9]}, ${topCard[10]}, ${topCard[11]}, ${topCard[12]} Deck: ${topCard[13]} Flip: ${this.selfWantNew}`);
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
        return (`OTHER: ${topCard[0]}, ${topCard[1]}, ${topCard[2]}, ${topCard[3]}, ${topCard[4]} Deck: ${topCard[5]} Flip: ${this.otherWantNew} \n\n\nMID: ${topCard[6]}, ${topCard[7]} \n\n\nSELF: ${topCard[8]}, ${topCard[9]}, ${topCard[10]}, ${topCard[11]}, ${topCard[12]} Deck: ${topCard[13]} Flip: ${this.selfWantNew}`);
    }
    //Prints the contents of all the cards for debugging
    printAll() {
        for (let deck of this.decks) {
            printDeck(deck);
        }
    }
    /**
    * Return the index of the array the key refers to while accounting for the player's role.
    * Returns -1 whne called with an invalid key
    * @param key The character sent by the listener
    * @param role The role of the person inputting
    * @returns the index of the array the key refers to while accounting for the player's role
    */
    static key_to_index(key, role) {
        if (key === "ENTER" && role === CONSTANTS.SELF)
            return CONSTANTS.SELF_DECK;
        if (key === "ENTER" && role === CONSTANTS.OTHER)
            return CONSTANTS.OTHER_DECK;
        if (key === "E" || key === "R" || key === "T")
            return CONSTANTS.MID_LEFT;
        if (key === "Y" || key === "U" || key === "I")
            return CONSTANTS.MID_RIGHT;
        if (key === "H")
            key = "G";
        let valid_keys = ["D", "F", "G", "J", "K"];
        if (!valid_keys.includes(key))
            return -1;
        return CONSTANTS[role + "_" + key];
    }
}
