import { transfer, Card } from "./public/card.js";
import { CONSTANTS } from "./public/constants.js";
import Game from "./public/game.js"

/**Creates a sample game that allows for every valid and invalid operation */
function sampleGame()
{
    var game = new Game("We've been together for so long");
    game.decks[CONSTANTS.OTHER_DECK] = JSON.parse(`{"location":"OTHER","cards":[{"rank":8,"suit":2,"faceup":false},{"rank":7,"suit":1,"faceup":false},{"rank":10,"suit":4,"faceup":false},{"rank":9,"suit":3,"faceup":false},{"rank":2,"suit":3,"faceup":false},{"rank":2,"suit":4,"faceup":false},{"rank":12,"suit":2,"faceup":false},{"rank":11,"suit":2,"faceup":false},{"rank":1,"suit":1,"faceup":false},{"rank":11,"suit":3,"faceup":false},{"rank":6,"suit":2,"faceup":false},{"rank":3,"suit":2,"faceup":false},{"rank":12,"suit":4,"faceup":false},{"rank":1,"suit":3,"faceup":false},{"rank":13,"suit":2,"faceup":false},{"rank":8,"suit":4,"faceup":false},{"rank":4,"suit":4,"faceup":false},{"rank":4,"suit":2,"faceup":false},{"rank":10,"suit":1,"faceup":false},{"rank":6,"suit":3,"faceup":false},{"rank":5,"suit":4,"faceup":false},{"rank":11,"suit":4,"faceup":false},{"rank":3,"suit":3,"faceup":false},{"rank":6,"suit":1,"faceup":false},{"rank":9,"suit":2,"faceup":false},{"rank":13,"suit":3,"faceup":false},{"rank":12,"suit":3,"faceup":false},{"rank":5,"suit":2,"faceup":false},{"rank":9,"suit":1,"faceup":false},{"rank":13,"suit":4,"faceup":false},{"rank":7,"suit":3,"faceup":false},{"rank":8,"suit":1,"faceup":false},{"rank":4,"suit":1,"faceup":false},{"rank":12,"suit":1,"faceup":false},{"rank":9,"suit":4,"faceup":false},{"rank":7,"suit":4,"faceup":false},{"rank":3,"suit":4,"faceup":false},{"rank":5,"suit":1,"faceup":false},{"rank":6,"suit":4,"faceup":false},{"rank":10,"suit":2,"faceup":false},{"rank":1,"suit":4,"faceup":false},{"rank":10,"suit":3,"faceup":false},{"rank":5,"suit":3,"faceup":false},{"rank":7,"suit":2,"faceup":false},{"rank":8,"suit":3,"faceup":false},{"rank":11,"suit":1,"faceup":false}]}`);
    game.decks[CONSTANTS.SELF_DECK] = JSON.parse(`{"location":"SELF","cards":[{"rank":2,"suit":1,"faceup":false},{"rank":2,"suit":2,"faceup":false},{"rank":1,"suit":2,"faceup":false},{"rank":3,"suit":1,"faceup":false}]}`);
    game.dealHand();
    game.decks[CONSTANTS.MID_LEFT].cards.unshift(JSON.parse(`{"rank":13,"suit":1,"faceup":true}`));
    game.decks[CONSTANTS.MID_RIGHT].cards.unshift(JSON.parse(`{"rank":4,"suit":3,"faceup":true}`));

    return game;
}

function flipHands(game)
{
    for(let i = 0; i < 5 ; i++)
    {
        if(game.decks[CONSTANTS.OTHER_D + i].cards.length !== 0)game.decks[CONSTANTS.OTHER_D + i].cards[0].faceup = true;
        if(game.decks[CONSTANTS.SELF_D + i].cards.length !== 0)game.decks[CONSTANTS.SELF_D + i].cards[0].faceup = true;
    }
    return game;
}

QUnit.module("Game - handIsEmpty()");

    QUnit.test("Game initialisaiton", function(assert) {
        let game = new Game("Test");
        game.handIsEmpty();
        assert.expect(2);
        assert.true(game.selfempty);
        assert.true(game.otherempty);
    });

    QUnit.test("Game start", function(assert) {
        let game = new Game("Test");
        game.dealHand();
        game.handIsEmpty();
        assert.expect(2);
        assert.false(game.selfempty);
        assert.false(game.otherempty);
    });

    QUnit.test("Midgame", function(assert) {
        let game = new Game("Test");
        game.dealHand();
        for(let i = 0; i < 5; i++)
        {
            game.decks[i].cards = [];
        }
        game.handIsEmpty();
        assert.expect(2);
        assert.false(game.selfempty);
        assert.true(game.otherempty);
    });

QUnit.module("Game - move()");

    QUnit.test("Flip own card", function(assert) {
        let game = sampleGame();
        let delta = game.move(CONSTANTS.SELF, CONSTANTS.SELF_F, CONSTANTS.SELF_F);
        assert.deepEqual(delta, {valid: true, operation: "FLIP", data: {index: CONSTANTS.SELF_F}});
    });

    QUnit.test("Stack own cards, valid", function(assert) {
        let game = sampleGame();
        game = flipHands(game);
        let delta = game.move(CONSTANTS.SELF, CONSTANTS.SELF_J, CONSTANTS.SELF_K);
        assert.deepEqual(delta, {valid: true, operation: "MOVE", data: {src: CONSTANTS.SELF_J, dst: CONSTANTS.SELF_K}});
    });

    QUnit.test("Stack own cards, invalid", function(assert) {
        let game = sampleGame();
        game = flipHands(game);
        let delta = game.move(CONSTANTS.SELF, CONSTANTS.SELF_G, CONSTANTS.SELF_J);
        assert.deepEqual(delta, {valid: false});
    });

    QUnit.test("Moving card to empty deck in hand", function(assert) {
        let game = sampleGame();
        game = flipHands(game);
        let delta = game.move(CONSTANTS.SELF, CONSTANTS.SELF_F, CONSTANTS.SELF_D);
        assert.deepEqual(delta, {valid: true, operation: "MOVE", data: {src: CONSTANTS.SELF_F, dst: CONSTANTS.SELF_D}});
    });

    QUnit.test("Moving card to middle, valid", function(assert) {
        let game = sampleGame();
        game = flipHands(game);
        let delta = game.move(CONSTANTS.SELF, CONSTANTS.SELF_G, CONSTANTS.MID_LEFT);
        assert.deepEqual(delta, {valid: true, operation: "MOVE", data: {src: CONSTANTS.SELF_G, dst: CONSTANTS.MID_LEFT}});
    });

    QUnit.test("moving card to middle, invalid", function(assert) {
        let game = sampleGame();
        game = flipHands(game);
        let delta = game.move(CONSTANTS.SELF, CONSTANTS.SELF_G, CONSTANTS.MID_RIGHT);
        assert.deepEqual(delta, {valid: false});
    });

    QUnit.test("Claim middle and redraw decks", function(assert) {
        let game = sampleGame();
        game = flipHands(game);

        transfer(game.decks[CONSTANTS.SELF_F], game.decks[CONSTANTS.MID_RIGHT]);
        transfer(game.decks[CONSTANTS.SELF_J], game.decks[CONSTANTS.MID_RIGHT]);
        transfer(game.decks[CONSTANTS.SELF_G], game.decks[CONSTANTS.MID_RIGHT]);
        transfer(game.decks[CONSTANTS.SELF_K], game.decks[CONSTANTS.MID_RIGHT]);

        game.decks[CONSTANTS.SELF_DECK].cards.push(new Card(1, 1));

        let delta = game.move(CONSTANTS.SELF, CONSTANTS.MID_RIGHT, CONSTANTS.MID_RIGHT);
        assert.deepEqual(delta, {valid: true, operation: "SHUFFLE", data: {full: false, self: CONSTANTS.MID_RIGHT, other: CONSTANTS.MID_LEFT}});
    });

    QUnit.test("Claim middle and win", function(assert) {
        let game = sampleGame();
        game = flipHands(game);

        transfer(game.decks[CONSTANTS.SELF_F], game.decks[CONSTANTS.MID_RIGHT]);
        transfer(game.decks[CONSTANTS.SELF_J], game.decks[CONSTANTS.MID_RIGHT]);
        transfer(game.decks[CONSTANTS.SELF_G], game.decks[CONSTANTS.MID_RIGHT]);
        transfer(game.decks[CONSTANTS.SELF_K], game.decks[CONSTANTS.MID_RIGHT]);

        let delta = game.move(CONSTANTS.SELF, CONSTANTS.MID_RIGHT, CONSTANTS.MID_RIGHT);

        assert.deepEqual(delta, {valid: true, operation: "WIN", data: { winner: CONSTANTS.SELF}});
    });

    QUnit.test("Claim middle, invalid", function(assert) {
        let game = sampleGame();
        game = flipHands(game);
        let delta = game.move(CONSTANTS.SELF, CONSTANTS.MID_RIGHT, CONSTANTS.MID_RIGHT);
        assert.deepEqual(delta, {valid: false});
    });

QUnit.module("Game - parse()");

    QUnit.test("Passing an invalid delta", function(assert) {
        let game = sampleGame();
        let delta = {valid: false};
        game.parse(delta, () => {});
        assert.ok(true)
        //assertions with deep equal 
    });

    QUnit.test("Flipping a card", function(assert) {
        let game = sampleGame();
        let delta = {valid: true, operation: "FLIP", data: {index: CONSTANTS.SELF_F}};
        game.parse(delta, () => {});
        assert.ok(game.decks[CONSTANTS.SELF_F].cards[0].faceup);
    });

    QUnit.test("Stacking own cards", function(assert) {
        let game = flipHands(sampleGame());
        
        let delta = {valid: true, operation: "MOVE", data: {src: CONSTANTS.SELF_J, dst: CONSTANTS.SELF_K}};
        game.parse(delta, () => {});

        assert.expect(2);
        assert.equal(game.decks[CONSTANTS.SELF_J].cards.length, 0);
        let correctcard = new Card(2, 2);
        correctcard.faceup = true;
        assert.propEqual(game.decks[CONSTANTS.SELF_K].cards[0], correctcard);
    });

    QUnit.test("Move card to empty deck in hand", function(assert) {
        let game = flipHands(sampleGame());
        let delta = {valid: true, operation: "MOVE", data: {src: CONSTANTS.SELF_F, dst: CONSTANTS.SELF_D}};
        game.parse(delta, () => {});

        assert.expect(2);
        assert.equal(game.decks[CONSTANTS.SELF_F].cards.length, 0);
        let correctcard = new Card(3, 1);
        correctcard.faceup = true;
        assert.propEqual(game.decks[CONSTANTS.SELF_D].cards[0], correctcard);
    });

    QUnit.test("Moving card to middle", function(assert) {
        let game = flipHands(sampleGame());
        let delta = {valid: true, operation: "MOVE", data: {src: CONSTANTS.SELF_G, dst: CONSTANTS.MID_LEFT}};
        game.parse(delta, () => {});

        assert.expect(2);
        assert.equal(game.decks[CONSTANTS.SELF_G].cards.length, 0);
        let correctcard = new Card(1, 2);
        correctcard.faceup = true;
        assert.propEqual(game.decks[CONSTANTS.MID_LEFT].cards[0], correctcard);
    }); 

    QUnit.test("Claim middle, shuffle, server side", function(assert) {
        let game = flipHands(sampleGame());

        transfer(game.decks[CONSTANTS.SELF_F], game.decks[CONSTANTS.MID_RIGHT]);
        transfer(game.decks[CONSTANTS.SELF_J], game.decks[CONSTANTS.MID_RIGHT]);
        transfer(game.decks[CONSTANTS.SELF_G], game.decks[CONSTANTS.MID_RIGHT]);
        transfer(game.decks[CONSTANTS.SELF_K], game.decks[CONSTANTS.MID_RIGHT]);

        game.decks[CONSTANTS.SELF_DECK].cards.push(new Card(1, 1));

        let delta = {valid: true, operation: "SHUFFLE", data: {full: false, self: CONSTANTS.MID_RIGHT, other: CONSTANTS.MID_LEFT}};
        game.parse(delta, () => {});

        game.handIsEmpty();

        assert.expect(5);
        assert.ok(game.otherempty);
        assert.ok(game.selfempty);

        assert.equal(game.decks[CONSTANTS.SELF_DECK].cards.length, 6);
        assert.equal(game.decks[CONSTANTS.OTHER_DECK].cards.length, 47); //There are 52 cards in the deck because a slipped an ace into it

        assert.ok(delta.data.full);
    });

    QUnit.test("Claim middle, shuffle, client side", function(assert) {
        let game = flipHands(sampleGame());
        let delta = JSON.parse(`{"valid":true,"operation":"SHUFFLE","data":{"full":true,"self":{"location":"SELF","cards":[{"rank":2,"suit":2,"faceup":false},{"rank":4,"suit":3,"faceup":false},{"rank":3,"suit":1,"faceup":false},{"rank":2,"suit":1,"faceup":false},{"rank":1,"suit":1,"faceup":false},{"rank":1,"suit":2,"faceup":false}]},"other":{"location":"OTHER","cards":[{"rank":7,"suit":3,"faceup":false},{"rank":11,"suit":1,"faceup":false},{"rank":8,"suit":4,"faceup":false},{"rank":9,"suit":2,"faceup":false},{"rank":9,"suit":3,"faceup":false},{"rank":3,"suit":3,"faceup":false},{"rank":13,"suit":4,"faceup":false},{"rank":7,"suit":2,"faceup":false},{"rank":11,"suit":2,"faceup":false},{"rank":4,"suit":4,"faceup":false},{"rank":4,"suit":2,"faceup":false},{"rank":12,"suit":4,"faceup":false},{"rank":8,"suit":3,"faceup":false},{"rank":6,"suit":1,"faceup":false},{"rank":7,"suit":4,"faceup":false},{"rank":3,"suit":4,"faceup":false},{"rank":1,"suit":3,"faceup":false},{"rank":13,"suit":3,"faceup":false},{"rank":12,"suit":3,"faceup":false},{"rank":10,"suit":2,"faceup":false},{"rank":4,"suit":1,"faceup":false},{"rank":7,"suit":1,"faceup":false},{"rank":6,"suit":4,"faceup":false},{"rank":9,"suit":4,"faceup":false},{"rank":12,"suit":2,"faceup":false},{"rank":12,"suit":1,"faceup":false},{"rank":13,"suit":1,"faceup":false},{"rank":6,"suit":2,"faceup":false},{"rank":13,"suit":2,"faceup":false},{"rank":2,"suit":3,"faceup":false},{"rank":11,"suit":4,"faceup":false},{"rank":5,"suit":4,"faceup":false},{"rank":1,"suit":1,"faceup":false},{"rank":2,"suit":4,"faceup":false},{"rank":8,"suit":2,"faceup":false},{"rank":5,"suit":2,"faceup":false},{"rank":3,"suit":2,"faceup":false},{"rank":6,"suit":3,"faceup":false},{"rank":11,"suit":3,"faceup":false},{"rank":5,"suit":3,"faceup":false},{"rank":10,"suit":3,"faceup":false},{"rank":10,"suit":4,"faceup":false},{"rank":5,"suit":1,"faceup":false},{"rank":9,"suit":1,"faceup":false},{"rank":8,"suit":1,"faceup":false},{"rank":1,"suit":4,"faceup":false},{"rank":10,"suit":1,"faceup":false}]}}}`);
        game.parse(delta, () => {});

        assert.expect(4);

        game.handIsEmpty(); 
        assert.ok(game.otherempty);
        assert.ok(game.selfempty);

        assert.propEqual(game.decks[CONSTANTS.SELF_DECK], JSON.parse(`{"location":"SELF","cards":[{"rank":2,"suit":2,"faceup":false},{"rank":4,"suit":3,"faceup":false},{"rank":3,"suit":1,"faceup":false},{"rank":2,"suit":1,"faceup":false},{"rank":1,"suit":1,"faceup":false},{"rank":1,"suit":2,"faceup":false}]}`))
        assert.propEqual(game.decks[CONSTANTS.OTHER_DECK], JSON.parse(`{"location":"OTHER","cards":[{"rank":7,"suit":3,"faceup":false},{"rank":11,"suit":1,"faceup":false},{"rank":8,"suit":4,"faceup":false},{"rank":9,"suit":2,"faceup":false},{"rank":9,"suit":3,"faceup":false},{"rank":3,"suit":3,"faceup":false},{"rank":13,"suit":4,"faceup":false},{"rank":7,"suit":2,"faceup":false},{"rank":11,"suit":2,"faceup":false},{"rank":4,"suit":4,"faceup":false},{"rank":4,"suit":2,"faceup":false},{"rank":12,"suit":4,"faceup":false},{"rank":8,"suit":3,"faceup":false},{"rank":6,"suit":1,"faceup":false},{"rank":7,"suit":4,"faceup":false},{"rank":3,"suit":4,"faceup":false},{"rank":1,"suit":3,"faceup":false},{"rank":13,"suit":3,"faceup":false},{"rank":12,"suit":3,"faceup":false},{"rank":10,"suit":2,"faceup":false},{"rank":4,"suit":1,"faceup":false},{"rank":7,"suit":1,"faceup":false},{"rank":6,"suit":4,"faceup":false},{"rank":9,"suit":4,"faceup":false},{"rank":12,"suit":2,"faceup":false},{"rank":12,"suit":1,"faceup":false},{"rank":13,"suit":1,"faceup":false},{"rank":6,"suit":2,"faceup":false},{"rank":13,"suit":2,"faceup":false},{"rank":2,"suit":3,"faceup":false},{"rank":11,"suit":4,"faceup":false},{"rank":5,"suit":4,"faceup":false},{"rank":1,"suit":1,"faceup":false},{"rank":2,"suit":4,"faceup":false},{"rank":8,"suit":2,"faceup":false},{"rank":5,"suit":2,"faceup":false},{"rank":3,"suit":2,"faceup":false},{"rank":6,"suit":3,"faceup":false},{"rank":11,"suit":3,"faceup":false},{"rank":5,"suit":3,"faceup":false},{"rank":10,"suit":3,"faceup":false},{"rank":10,"suit":4,"faceup":false},{"rank":5,"suit":1,"faceup":false},{"rank":9,"suit":1,"faceup":false},{"rank":8,"suit":1,"faceup":false},{"rank":1,"suit":4,"faceup":false},{"rank":10,"suit":1,"faceup":false}]}`))
    }); 

    QUnit.test("Claim middle, win", function(assert) {
        let game = flipHands(sampleGame());

        transfer(game.decks[CONSTANTS.SELF_F], game.decks[CONSTANTS.MID_RIGHT]);
        transfer(game.decks[CONSTANTS.SELF_J], game.decks[CONSTANTS.MID_RIGHT]);
        transfer(game.decks[CONSTANTS.SELF_G], game.decks[CONSTANTS.MID_RIGHT]);
        transfer(game.decks[CONSTANTS.SELF_K], game.decks[CONSTANTS.MID_RIGHT]);

        let delta = {valid: true, operation: "WIN", data: { winner: CONSTANTS.SELF}};

        var won = false;
        game.parse(delta, () => {won = true;});
        assert.ok(won);
    });

/*
    QUnit.test("", function(assert) {
        let game = sampleGame();
        let delta = ;
        game.parse(delta, () => {});
        //assertions with deep equal 
    }); */

QUnit.module("Game - key_to_index()");

    QUnit.test("Other, valid", function(assert) {
        assert.equal(Game.key_to_index("D", CONSTANTS.OTHER), CONSTANTS.OTHER_D);
    })

    QUnit.test("Other, invalid", function(assert) {
        assert.equal(Game.key_to_index("d", CONSTANTS.OTHER), -1);
    })

    QUnit.test("Mid, valid", function(assert) {
        assert.equal(Game.key_to_index("E", CONSTANTS.OTHER), CONSTANTS.MID_LEFT);
    })

    QUnit.test("Mid, valid", function(assert) {
        assert.equal(Game.key_to_index("U", CONSTANTS.OTHER), CONSTANTS.MID_RIGHT);
    })

    QUnit.test("Self, valid", function(assert) {
        assert.equal(Game.key_to_index("D", CONSTANTS.SELF), CONSTANTS.SELF_D);
    })

//Either put game.js in this folder and serve it up with a server or... idk - yeah, just copy the files after copmilation and then setup...
//or check out if using require causes any problems - you are on an alternate branch so go wild i guess

console.log("The sample game follows: \n\n")
sampleGame().printAll();

console.log("\n\nD F G J K DECK");