/* https://github.com/angular/protractor/blob/master/docs/toc.md */


describe('NineMen-sMorris', function() {

    'use strict';

    beforeEach(function() {
        browser.get('http://localhost:9002/game.min.html');
    });

    function getDiv(row, col) {
        return element(by.id('e2e_test_div_' + row + 'x' + col));
    }

    function getImg(row, col) {
        return element(by.id('e2e_test_img_' + row + 'x' + col));
    }

    function expectPiece(row, col, pieceKind) {
        // Careful when using animations and asserting isDisplayed:
        // Originally, my animation started from {opacity: 0;}
        // And then the image wasn't displayed.
        // I changed it to start from {opacity: 0.1;}
        var picUrl;

        if (pieceKind === "")
            picUrl = null;
        else if (pieceKind === "W")
            picUrl = "http://localhost:9002/imgs/john.png";
        else if (pieceKind === "B")
            picUrl = "http://localhost:9002/imgs/nick.png";
        else if (pieceKind === "A")
            picUrl = "http://localhost:9002/imgs/john_selected.png";
        else if (pieceKind === "C")
            picUrl = "http://localhost:9002/imgs/nick_selected.png";

        expect(getImg(row, col).isDisplayed()).toEqual(pieceKind === "" ? false : true);
        if (pieceKind !== "")
            expect(getImg(row, col).getAttribute("src")).toEqual(picUrl);
    }

    function expectBoard(board) {
        for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 8; col++) {
                console.log(row+" "+col+" "+board[row][col]);
                expectPiece(row, col, board[row][col]);
            }
        }
    }

    function clickDivAndExpectPiece(row, col, pieceKind) {
        getDiv(row, col).click();
        expectPiece(row, col, pieceKind);
    }

    // playMode is either: 'passAndPlay', 'playAgainstTheComputer', 'onlyAIs',
    // or a number representing the playerIndex (-2 for viewer, 0 for white player, 1 for black player, etc)
    function setMatchState(matchState, playMode) {
        browser.executeScript(function(matchStateInJson, playMode) {
            var stateService = window.e2e_test_stateService;
            stateService.setMatchState(angular.fromJson(matchStateInJson));
            stateService.setPlayMode(angular.fromJson(playMode));
            angular.element(document).scope().$apply(); // to tell angular that things changes.
        }, JSON.stringify(matchState), JSON.stringify(playMode));
    }


    it('should have a title', function () {
        expect(browser.getTitle()).toEqual("Nine Men's Morris");
    });

    it('should have an empty NNM board', function () {
        expectBoard(
            [['', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '']]);
    });



    it('should show W if I click in 0x0', function () {
        clickDivAndExpectPiece(0, 0, "W");
        expectBoard(
            [['W', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '']]);
    });


    it('should ignore clicking on a non-empty cell', function () {
        clickDivAndExpectPiece(0, 0, "W");
        clickDivAndExpectPiece(0, 0, "W"); // clicking on a non-empty cell doesn't do anything.
        clickDivAndExpectPiece(1, 1, "B");
        expectBoard(
            [['W', '', '', '', '', '', '', '', ''],
                ['', 'B', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '']]);
    });


    var board1 = [
        ['W', '', 'B', 'B', '', 'B', '', ''],
        ['', 'W', '', 'W', 'W', '', 'B', ''],
        ['', '', '', '', '', '', '', '']
    ];

    var board2 = [
        ['', 'W', 'B', 'B', '', 'B', '', ''],
        ['', 'W', '', 'W', 'W', '', 'B', ''],
        ['', '', '', '', '', '', '', '']
    ];

    var board3 = [
        ['', 'W', 'B', '', 'B', 'B', '', ''],
        ['', 'W', '', 'W', 'W', '', 'B', ''],
        ['', '', '', '', '', '', '', '']
    ];

    var board4 = [
        ['', 'W', 'B', '', 'B', 'B', '', ''],
        ['', 'W', '', 'W', 'W', '', '', ''],
        ['', '', '', '', '', '', '', '']
    ];
    var delta1 = {destination: [0, 5], origin: [0, 6]};

    var delta2 = {destination: [0, 1], origin: [0, 0]};

    var delta3 = {destination: [1, 6], origin: [null, null]};

    var delta4 = {destination: [0, 1], origin: [null, null]};

    var playerStates1 = [{phase: 2, count: 20, phaseLastTime: 2, alreadyMills: []},
        {phase: 2, count: 20, phaseLastTime: 2, alreadyMills: []}];

    var playerStates2 = [{phase: 2, count: 21, phaseLastTime: 2, alreadyMills: []},
        {phase: 2, count: 20, phaseLastTime: 2, alreadyMills: []}];

    var playerStates3 = [{phase: 1, count: 4, phaseLastTime: 1, alreadyMills: []},
        {phase: 1, count: 4, phaseLastTime: 1, alreadyMills: []}];

    var playerStates3 = [{phase: 1, count: 4, phaseLastTime: 1, alreadyMills: []},
        {phase: 1, count: 3, phaseLastTime: 1, alreadyMills: []}];

    var matchState2 = {
        turnIndexBeforeMove: 0,
        turnIndex: 1,
        endMatchScores: null,
        lastMove: [{setTurn: {turnIndex: 1}},
            {set: {key: 'board', value: board2}},
            {set: {key: 'playerStates', value: playerStates2}},
            {set: {key: 'delta', value: delta3}}],
        lastState: {board: board1, delta: delta1, playerStates: playerStates1},
        currentState: {board: board2, delta: delta3, playerStates: playerStates2},
        lastVisibleTo: {},
        currentVisibleTo: {}
    };


    it('a normal select in phase 2', function () {
        setMatchState(matchState2, 'passAndPlay');
        expectBoard(board2);
        clickDivAndExpectPiece(0, 3, "C");
        clickDivAndExpectPiece(0, 4, "B");
        expectBoard(board3);
    });

    var matchState3 = {
        turnIndexBeforeMove: 0,
        turnIndex: 1,
        endMatchScores: null,
        lastMove: [{setTurn: {turnIndex: 1}},
            {set: {key: 'board', value: board2}},
            {set: {key: 'playerStates', value: playerStates3}},
            {set: {key: 'delta', value: delta2}}],
        lastState: {board: board4, delta: delta4, playerStates: playerStates4},
        currentState: {board: board2, delta: delta2, playerStates: playerStates3},
        lastVisibleTo: {},
        currentVisibleTo: {}
    };

    it('To form a morris in phase 1', function () {
        setMatchState(matchState3, 'passAndPlay');
        expectBoard(board2);
//        clickDivAndExpectPiece(0, 3, "C");
//        clickDivAndExpectPiece(0, 4, "B");
//        expectBoard(board3);
    });

/*
    it('should end game if X wins', function () {
        for (var col = 0; col < 3; col++) {
            clickDivAndExpectPiece(1, col, "X");
            // After the game ends, player "O" click (in cell 2x2) will be ignored.
            clickDivAndExpectPiece(2, col, col === 2 ? "" : "O");
        }
        expectBoard(
            [['', '', ''],
                ['X', 'X', 'X'],
                ['O', 'O', '']]);
    });
*/

/*    it('should end the game in tie', function () {
        clickDivAndExpectPiece(0, 0, "X");
        clickDivAndExpectPiece(1, 0, "O");
        clickDivAndExpectPiece(0, 1, "X");
        clickDivAndExpectPiece(1, 1, "O");
        clickDivAndExpectPiece(1, 2, "X");
        clickDivAndExpectPiece(0, 2, "O");
        clickDivAndExpectPiece(2, 0, "X");
        clickDivAndExpectPiece(2, 1, "O");
        clickDivAndExpectPiece(2, 2, "X");
        expectBoard(
            [['X', 'X', 'O'],
                ['O', 'O', 'X'],
                ['X', 'O', 'X']]);
    });

    var delta1 = {row: 1, col: 0};
    var board1 =
        [['X', 'O', ''],
            ['X', '', ''],
            ['', '', '']];
    var delta2 = {row: 1, col: 1};
    var board2 =
        [['X', 'O', ''],
            ['X', 'O', ''],
            ['', '', '']];
    var delta3 = {row: 2, col: 0};
    var board3 =
        [['X', 'O', ''],
            ['X', 'O', ''],
            ['X', '', '']];
    var delta4 = {row: 2, col: 1};
    var board4 =
        [['X', 'O', ''],
            ['X', 'O', ''],
            ['', 'X', '']];

    var matchState2 = {
        turnIndexBeforeMove: 1,
        turnIndex: 0,
        endMatchScores: null,
        lastMove: [{setTurn: {turnIndex: 0}},
            {set: {key: 'board', value: board2}},
            {set: {key: 'delta', value: delta2}}],
        lastState: {board: board1, delta: delta1},
        currentState: {board: board2, delta: delta2},
        lastVisibleTo: {},
        currentVisibleTo: {}
    };
    var matchState3 = {
        turnIndexBeforeMove: 0,
        turnIndex: -2,
        endMatchScores: [1, 0],
        lastMove: [{endMatch: {endMatchScores: [1, 0]}},
            {set: {key: 'board', value: board3}},
            {set: {key: 'delta', value: delta3}}],
        lastState: {board: board2, delta: delta2},
        currentState: {board: board3, delta: delta3},
        lastVisibleTo: {},
        currentVisibleTo: {}
    };
    var matchState4 = {
        turnIndexBeforeMove: 0,
        turnIndex: 1,
        endMatchScores: null,
        lastMove: [{setTurn: {turnIndex: 1}},
            {set: {key: 'board', value: board4}},
            {set: {key: 'delta', value: delta4}}],
        lastState: {board: board2, delta: delta2},
        currentState: {board: board4, delta: delta4},
        lastVisibleTo: {},
        currentVisibleTo: {}
    };

    it('can start from a match that is about to end, and win', function () {
        setMatchState(matchState2, 'passAndPlay');
        expectBoard(board2);
        clickDivAndExpectPiece(2, 0, "X"); // winning click!
        clickDivAndExpectPiece(2, 1, ""); // can't click after game ended
        expectBoard(board3);
    });

    it('cannot play if it is not your turn', function () {
        // Now make sure that if you're playing "O" (your player index is 1) then
        // you can't do the winning click!
        setMatchState(matchState2, 1); // playMode=1 means that yourPlayerIndex=1.
        expectBoard(board2);
        clickDivAndExpectPiece(2, 0, ""); // can't do the winning click!
        expectBoard(board2);
    });

    it('can start from a match that ended', function () {
        setMatchState(matchState3, 'passAndPlay');
        expectBoard(board3);
        clickDivAndExpectPiece(2, 1, ""); // can't click after game ended
    });

    it('should make an AI move after at most 1.5 seconds', function () {
        setMatchState(matchState4, 'playAgainstTheComputer');
        browser.sleep(1500);
        expectBoard(
            [['X', 'O', ''],
                ['X', 'O', ''],
                ['O', 'X', '']]);
        clickDivAndExpectPiece(2, 2, "X"); // Human-player X did a very stupid move!
        browser.sleep(1500); // AI will now make the winning move
        expectBoard(
            [['X', 'O', 'O'],
                ['X', 'O', ''],
                ['O', 'X', 'X']]);
        clickDivAndExpectPiece(1, 2, ""); // Can't make a move after game is over
    });
    */
});
