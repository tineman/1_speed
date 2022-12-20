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

    constructor(rank:number, suit:number)
    {
        this.rank = rank;
        this.suit = suit;
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

//Shuffles the cards
function shuffle(deck:Deck)
{
    for(let i = 0; i < deck.cards.length; i++)
    {
        let j = Math.floor(Math.random() * deck.cards.length);
        let temp = deck.cards[i];
        deck.cards[i] = deck.cards[j];
        deck.cards[j] = temp;
    }
}

//Transfers the first card from src to dst. Asej
function transfer(src:Deck, dst:Deck)
{
    dst.cards.unshift(src.cards.shift());
}

//SELF to SELF and OTHER to OTHER
//SELF to MID and OTHER to MID

//Checks if the move is valid. Checks OTHER for AI purposes
function isValid(src:Deck, dst:Deck)
{
    if((src.location == "SELF" && dst.location == "SELF") || (src.location == "OTHER" && dst.location == "OTHER"))
    {
        if(src.cards.length == 0 || dst.cards.length == 0) return false;
        return src.cards[0].rank == dst.cards[0].rank;
    }

    else if((src.location == "SELF" || src.location == "OTHER") && dst.location == "MID")
    {
        if(src.cards.length == 0 || dst.cards.length == 0) return false;
        return isAdjacent(src.cards[0], dst.cards[0]);
    }
}


//Test all functions individuall with a unit


//test with a terminal based application
    //print cards, make moves from one deck to another


//Game loop

//3 AIs - B.O.G.O. (bogo algs - cat pfp), B.O.B.Y (shows you how to play + normal AI), B.A.K.A. (Bread and kabob Ace - bluffing and L and ratio)