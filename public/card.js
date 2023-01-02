"use strict";
/*

OTHER <= location
[DO] [FO] [GO] [JO] [KO] [DECKO] <= actual variable names


        MID
        [LEFTM] [RIGHTM]


SELF
[DS] [FS] [GS] [JS] [KS] [DECKS]

Game = [DO, FO, GO, JO, KO, DECKO, LEFTM, RIGHTN, DS, FS, GS, JS, KS, DECKS]
Move, check if it wins
Typescript Win (interface)

*/
//Valid moves
/*
A 2 3 4 5 .. K => 1 2 3 4 5 ... 13

SELF to SELF - If they are the same card
SELF to MID - if the cards are adjacent
*/
class Card {
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
        this.faceup = false;
    }
}
//Check if two cards are adjacent
function isAdjacent(card1, card2) {
    return (Math.abs(card1.rank - card2.rank) == 1 || Math.abs(card1.rank - card2.rank) == 12);
}
class Deck {
    constructor(location) {
        this.location = location;
        this.cards = []; //This is really important before calling any of the methods of array
        //on it - otherwise, javascript, which doesn't know anything about types will think you're
        //trying to access a non-existent property of a generic object
    }
}
//Debug
//Prints everything in a deck from the top to bottom
function printDeck(deck) {
    console.log(`The deck ${deck.location} has the following cards:`);
    for (let card of deck.cards) {
        console.log(`${card.rank} of ${card.suit}`);
    }
}
//Populates a deck with a full deck
function populate(deck) {
    for (let i = 1; i <= 13; i++) {
        for (let j = 1; j <= 4; j++) {
            deck.cards.unshift(new Card(i, j));
        }
    }
}
/**
 * Shuffle the given deck and turn all the cards facedown
 * @param deck
 */
function shuffle(deck) {
    for (let i = 0; i < deck.cards.length; i++) {
        let j = Math.floor(Math.random() * deck.cards.length);
        let temp = deck.cards[i];
        deck.cards[i] = deck.cards[j];
        deck.cards[j] = temp;
    }
    for (let card of deck.cards) {
        card.faceup = false;
    }
}
//Transfers the first card from src to dst. Asej
function transfer(src, dst) {
    dst.cards.unshift(src.cards.shift());
}
//SELF to SELF and OTHER to OTHER
//SELF to MID and OTHER to MID
//Checks if the move is valid. Checks OTHER for AI purposes. This checks validity for the client and the server.
function isValid(src, dst) {
    //Moves a card in their own deck.
    if ((src.location == "SELF" && dst.location == "SELF") || (src.location == "OTHER" && dst.location == "OTHER")) {
        //Cannot happen if either decks are empty, if the decks are the same, or if either of the decks are facedown
        if (src.cards.length == 0)
            return false;
        if (src == dst)
            return true; //flip
        if (dst.cards.length == 0)
            return true; //moving onto an empty space
        if (!src.cards[0].faceup || !dst.cards[0].faceup)
            return false;
        return src.cards[0].rank == dst.cards[0].rank;
    }
    //Moves a card from a player's hand to an opponent's
    else if ((src.location == "SELF" || src.location == "OTHER") && dst.location == "MID") {
        if (src.cards.length == 0 || dst.cards.length == 0 || !src.cards[0].faceup || !dst.cards[0].faceup)
            return false;
        return isAdjacent(src.cards[0], dst.cards[0]);
    }
    //"Slaps" the middle to win. The Game checks the win condition seperately
    else if (src.location == "MID" && dst.location == "MID")
        return true;
    return false;
}
/**
 * Deals cards from a player's deck to their five "action slots". Deals 1 to each deck, then 1 to the first 4, etc.
 * If there are not enough cards, the process terminates
 * @param src The source deck
 * @param dstarr The array of decks
 * @param dstindex The index of the first deck in the array
 */
function startDeck(src, dstarr, dstindex) {
    for (let i = 0; i < 5; i++) {
        for (let j = 4; j >= i && src.cards.length != 0; j--) {
            transfer(src, dstarr[dstindex + j]);
        }
    }
}
export { Card, isAdjacent, Deck, printDeck, populate, shuffle, transfer, isValid, startDeck };
