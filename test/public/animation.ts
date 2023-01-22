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
 * Return the index of gameElements index refers to given a certain role.
 * @param index the index of the card in obect Game
 * @param role the player's role
 */
function roleAdapter(index:number, role:string)
{
    if(role === CONSTANTS.OTHER)
    {
        if(CONSTANTS.OTHER_D <= index && index <= CONSTANTS.SELF_D) return index + 8; //maps OTHER D-K to SELF D-K
        else if(CONSTANTS.SELF_D <= index && index <= CONSTANTS.SELF_K) return index - 8; //Vice versa
        else if(index === CONSTANTS.OTHER_DECK) return CONSTANTS.SELF_DECK; //maps OTHER deck to SELF deck
        else if(index === CONSTANTS.SELF_DECK) return CONSTANTS.OTHER_DECK; //vice versa
    }
    return index;
}

/**
 * Update the card images
 * @param index 
 * @param card 
 */
export function updateHTML(cards:Card[], role:string)
{
    for(let i = 0; i < 14; i++)
    {
        //Normal card
        let card = cards[i];
        if(card.rank > 0 && card.rank < 14)
        {
            //@ts-ignore
            if(card.faceup) gameElements[roleAdapter(i, role)].context.drawImage(img, ((card.rank - 1) * 18), ((card.suit - 1) * 22), 18, 22, 0, 0, CONSTANTS.CARD_WIDTH, CONSTANTS.CARD_HEIGHT);
            //@ts-ignore
            else gameElements[roleAdapter(i, role)].context.drawImage(img, 179, 96, 18, 22, 0, 0, CONSTANTS.CARD_WIDTH, CONSTANTS.CARD_HEIGHT);
        }
        switch (card.rank) {
            case CONSTANTS.EMPTY:
                //@ts-ignore
                gameElements[roleAdapter(i, role)].context.drawImage(img, 160, 96, 18, 22, 0, 0, CONSTANTS.CARD_WIDTH, CONSTANTS.CARD_HEIGHT);
                return;

            case CONSTANTS.STACK:
                
                return;
        }
    }
    
    //Special cards (for OK card, stack card [rank indicates stack size]) //add constants
}

/**
 * Parses delta and create the corresponding animation
 * @param delta 
 */
function parseAnimationDelta(delta)
{

}