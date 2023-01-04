export const CONSTANTS =
{
    //locations
    SELF: "SELF",
    OTHER: "OTHER",
    MID: "MID",

    //card indicies
    /* Use the numbers to hit speed/center decks? space + center to claim a final deck?

    OTHER <= location
    [DO] [FO] [GO] [JO] [KO] [DECKO] <= actual variable names


            MID
            [LEFTM] [RIGHTM]


    SELF
    [DS] [FS] [GS] [JS] [KS] [DECKS]

    index = 0   1   2   3   4   5      6      7       8   9   10  11  12  13
    deck = [DO, FO, GO, JO, KO, DECKO, LEFTM, RIGHTN, DS, FS, GS, JS, KS, DECKS] (6 is other-associated, 7 is self-associated)

    */
   OTHER_D: 0,
   OTHER_F: 1,
   OTHER_G: 2,
   OTHER_J: 3,
   OTHER_K: 4,
   OTHER_DECK: 5,

   MID_LEFT: 6,
   MID_RIGHT: 7,

   SELF_D: 8,
   SELF_F: 9,
   SELF_G: 10,
   SELF_J: 11,
   SELF_K: 12,
   SELF_DECK: 13

};