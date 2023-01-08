"use strict"
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

class Card
{
    rank:number;
    suit:number; //{1, 2, 3, 4} => {"Spade", "Heart", "Club", "Diamond"}
    faceup:boolean;

    constructor(rank:number, suit:number)
    {
        this.rank = rank;
        this.suit = suit;
        this.faceup = false;
    }
}

//Check if two cards are adjacent
function isAdjacent(card1:Card, card2:Card)
{
    return (Math.abs(card1.rank - card2.rank) == 1 || Math.abs(card1.rank - card2.rank) == 12);
}

class Deck
{
    cards:Array<Card>;
    location:string;
    constructor(location:string)
    {
        this.location = location;
        this.cards = []; //This is really important before calling any of the methods of array
        //on it - otherwise, javascript, which doesn't know anything about types will think you're
        //trying to access a non-existent property of a generic object
    }
}

//Debug
//Prints everything in a deck from the top to bottom
function printDeck(deck:Deck)
{
    console.log(`The deck ${deck.location} has the following cards:`);
    for(let card of deck.cards)
    {
        console.log(`${card.rank} of ${card.suit}`);
    }
}

//Populates a deck with a full deck
function populate(deck:Deck)
{
    for(let i = 1; i <= 13; i++)
    {
        for(let j = 1; j <= 4; j++)
        {
            deck.cards.unshift(new Card(i, j));
        }
    }
}

/**
 * Shuffle the given deck and turn all the cards facedown
 * @param deck
 */
function shuffle(deck:Deck)
{
    for(let i = 0; i < deck.cards.length; i++)
    {
        let j = Math.floor(Math.random() * deck.cards.length);
        let temp = deck.cards[i];
        deck.cards[i] = deck.cards[j];
        deck.cards[j] = temp;
    }

    for(let card of deck.cards)
    {
        card.faceup = false;
    }
}

//Transfers the first card from src to dst. Asej
function transfer(src:Deck, dst:Deck)
{
    dst.cards.unshift(src.cards.shift());
}

//SELF to SELF and OTHER to OTHER
//SELF to MID and OTHER to MID

//Checks if the move is valid. Checks OTHER for AI purposes. This checks validity for the client and the server.
function isValid(src:Deck, dst:Deck)
{

    //Moves a card in their own hand.
    if((src.location == "SELF" && dst.location == "SELF") || (src.location == "OTHER" && dst.location == "OTHER"))
    {
        //Cannot happen if either decks are empty, if the decks are the same, or if either of the decks are facedown
        
        if(src.cards.length == 0) return false;
        if(src == dst) return true; //flip
        if(dst.cards.length == 0) return true; //moving onto an empty space
        if(!src.cards[0].faceup || !dst.cards[0].faceup) return false;
        return src.cards[0].rank == dst.cards[0].rank;
    }

    //Moves a card from a player's hand to an opponent's
    else if((src.location == "SELF" || src.location == "OTHER") && dst.location == "MID")
    {
        if(src.cards.length == 0 || dst.cards.length == 0 || !src.cards[0].faceup || !dst.cards[0].faceup) return false;
        return isAdjacent(src.cards[0], dst.cards[0]);
    }

    //"Slaps" the middle to win. The Game checks the win condition seperately
    else if(src.location == "MID" && dst.location == "MID") return true;
    return false;
}

/**
 * Deals cards from a player's deck to their five "action slots". Deals 1 to each deck, then 1 to the first 4, etc.
 * If there are not enough cards, the process terminates
 * @param src The source deck
 * @param dstarr The array of decks
 * @param dstindex The index of the first deck in the array
 */
function startDeck(src:Deck, dstarr:Array<Deck>, dstindex:number)
{
    for(let i = 0; i < 5; i++)
    {
        for(let j = 4; j >= i && src.cards.length != 0; j--)
        {
            transfer(src, dstarr[dstindex + j]);
        }
    }
}

export {Card, isAdjacent, Deck, printDeck, populate, shuffle, transfer, isValid, startDeck};

/*
//Testing isValid

console.log("Testing deck : isValid...")
let src = new Deck("SELF");
let dst = new Deck("SELF");


//self to self

if(isValid(src, dst)) console.log("fail0");

src.cards.push(new Card(1, 1));
dst.cards.push(new Card(1, 2));

if(isValid(src, src)) console.log("fail1");

if(isValid(src, dst)) console.log("fail2");

src.cards[0].faceup = true;
dst.cards[0].faceup = true;

if(!isValid(src, dst)) console.log("fail3");



let dst2 = new Deck("MID");
if(isValid(src, dst2)) console.log("fail4");

dst2.cards.push(new Card(13, 1));
if(isValid(src, dst2)) console.log("fail5");

dst2.cards[0].faceup = true;
if(!isValid(src, dst2)) console.log("fail6");

dst2.cards.unshift(new Card(1, 4));
dst2.cards[0].faceup = true;
if(isValid(src, dst2)) console.log("fail7");

let mid = new Deck("MID");
if(!isValid(mid, mid)) console.log("fail8");

console.log("Finished Testing!");

*/

//decksrc.cards.push(new Card(1, 1));

/*

//Testing various functions
if(!isAdjacent(new Card(1, 1), new Card(13, 1))) console.log("fail1");
if(!isAdjacent(new Card(13, 1), new Card(1, 1))) console.log("fail2");
if(isAdjacent(new Card(2, 1), new Card(13, 1))) console.log("fail3");
if(!isAdjacent(new Card(1, 1), new Card(2, 1))) console.log("fail4");
if(isAdjacent(new Card(4, 1), new Card(13, 1))) console.log("fail5");

let deck = new Deck("test6");

console.log("Creating a new deck...");
populate(deck);
printDeck(deck);

console.log("Shuffling said deck...");
shuffle(deck);
printDeck(deck);

let src = new Deck("src");
let dst = new Deck("dst");

src.cards.unshift(new Card(1, 1));
src.cards.unshift(new Card(2, 1));

dst.cards.unshift(new Card(3, 1));
dst.cards.unshift(new Card(4, 1));

transfer(src, dst);

printDeck(src); //should be 1
printDeck(dst); //should be 2, 4, 3 (top to bottom)


/*
//Testing startDeck
//Complete deck

let decksrc = new Deck("src");
let deckarr = [new Deck("1"), new Deck("2"), new Deck("3"), new Deck("4"), new Deck("5")];

populate(decksrc);

startDeck(decksrc, deckarr, 0)

for(let i = 0; i < 5; i++)
{
    if(deckarr[i].cards.length != (i + 1)) console.log("fail6");
    printDeck(deckarr[i]);
}

//incomplete deck

let decksrc2 = new Deck("src");
let deckarr2 = [new Deck("1"), new Deck("2"), new Deck("3"), new Deck("4"), new Deck("5")];

decksrc2.cards = [new Card(1, 1), new Card(1, 2), new Card(1, 3)];
startDeck(decksrc2, deckarr2, 0);


if(deckarr2[0].cards.length != 0) console.log("fail7");
if(deckarr2[1].cards.length != 0) console.log("fail7");
if(deckarr2[2].cards.length != 1) console.log("fail7");
if(deckarr2[3].cards.length != 1) console.log("fail7");
if(deckarr2[4].cards.length != 1) console.log("fail7");

for(let i = 0; i < 5; i++)
{
    printDeck(deckarr2[i]);
}

*/

//3 AIs - B.O.G.O. (bogo algs - cat pfp), B.O.B.Y (shows you how to play + normal AI), B.A.K.A. (Bread and kabob Ace - bluffing and L and ratio)