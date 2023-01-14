//Function that takes a card and returns an HTML element (card)
//

import { Card } from "./card.js";
import { CONSTANTS } from "./constants.js";

/*
Get a function that takes in a card and a deck index and updates that canvas
*/

//Get references to all canvases and their contexts
var gameElements = [];

for(let i = 0; i < 14; i++)
{
    //@ts-ignore
    gameElements.push({canvas: document.getElementById(`${i}`), context: document.getElementById(`${i}`).getContext("2d")});
    //@ts-ignore
    gameElements[i].context.imageSmoothingEnabled = false;
}

//Load spritesheet
const img = new Image();
img.src = "assets.png";


/**
 * Update the HTML at index with card
 * @param index 
 * @param card 
 */
export function updateHTML(index:number, card:Card)
{
    //Normal card
    if(card.rank > 0 && card.rank < 14)
    {
        //@ts-ignore
        if(card.faceup) gameElements[index].context.drawImage(img, ((card.rank - 1) * 18), ((card.suit - 1) * 22), 18, 22, 0, 0, CONSTANTS.CARD_WIDTH, CONSTANTS.CARD_HEIGHT);
        //@ts-ignore
        else gameElements[index].context.drawImage(img, 179, 96, 18, 22, 0, 0, CONSTANTS.CARD_WIDTH, CONSTANTS.CARD_HEIGHT);
    }
    switch (card.rank) {
        case CONSTANTS.EMPTY:
            //@ts-ignore
            gameElements[index].context.drawImage(img, 160, 96, 18, 22, 0, 0, CONSTANTS.CARD_WIDTH, CONSTANTS.CARD_HEIGHT);
            return;

        case CONSTANTS.STACK:
            
            return;
    }
    //Special cards (for OK card, stack card [rank indicates stack size]) //add constants
}