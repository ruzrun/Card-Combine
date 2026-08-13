/* =========================
   ELEMENTS
========================= */

const gameBoard = document.getElementById("gameBoard");

const scoreDisplay =
    document.getElementById("score");

const bestScoreDisplay =
    document.getElementById("bestScore");

const comboDisplay =
    document.getElementById("combo");

const nextCardDisplay =
    document.getElementById("nextCard");

const gameMessage =
    document.getElementById("gameMessage");

const restartButton =
    document.getElementById("restartButton");

const musicButton =
    document.getElementById("musicButton");


/* =========================
   GAME SETTINGS
========================= */

const BOARD_SIZE = 4;

const TOTAL_CELLS =
    BOARD_SIZE * BOARD_SIZE;


/*
    Starting cards.

    The game begins with
    two cards already on the board.
*/

const STARTING_CARDS = 2;


/*
    Possible cards that can appear.

    Higher cards become possible
    later as your score increases.
*/

const BASIC_CARDS = [2, 2, 2, 2, 4];


/* =========================
   GAME STATE
========================= */

let board = [];

let currentCard = 2;

let nextCard = 2;

let score = 0;

let bestScore =
    Number(
        localStorage.getItem(
            "cardCombineBestScore"
        )
    ) || 0;

let combo = 0;

let gameActive = true;


/* =========================
   MUSIC
========================= */

const backgroundMusic =
    new Audio("audio/game.mp3");

backgroundMusic.loop = true;

backgroundMusic.volume = 0.25;

let musicEnabled = true;


backgroundMusic.play()
    .then(() => {

        musicButton.textContent =
            "🎵 Music On";

    })
    .catch(() => {

        musicButton.textContent =
            "🎵 Start Music";

    });


musicButton.addEventListener(
    "click",
    () => {

        if (musicEnabled) {

            musicEnabled = false;

            backgroundMusic.pause();

            musicButton.textContent =
                "🔇 Music Off";

        } else {

            musicEnabled = true;

            backgroundMusic
                .play()
                .then(() => {

                    musicButton.textContent =
                        "🎵 Music On";

                })
                .catch(() => {

                    musicButton.textContent =
                        "🎵 Start Music";

                });

        }

    }
);


/* =========================
   INITIALISE GAME
========================= */

function startGame() {

    board =
        Array(TOTAL_CELLS).fill(null);

    score = 0;

    combo = 0;

    gameActive = true;


    currentCard =
        generateCard();


    nextCard =
        generateCard();


    scoreDisplay.textContent =
        score;

    bestScoreDisplay.textContent =
        bestScore;

    comboDisplay.textContent =
        combo;


    /*
        Put a couple of cards
        onto the starting board.
    */

    placeStartingCards();


    updateNextCard();

    renderBoard();


    gameMessage.textContent =
        "Choose a space for your card 💕";

}


/* =========================
   STARTING CARDS
========================= */

function placeStartingCards() {

    const available =
        getEmptyCells();


    for (
        let i = 0;
        i < STARTING_CARDS;
        i++
    ) {

        if (available.length === 0) {
            break;
        }


        const randomIndex =
            Math.floor(
                Math.random() *
                available.length
            );


        const cellIndex =
            available.splice(
                randomIndex,
                1
            )[0];


        board[cellIndex] =
            generateCard();

    }

}


/* =========================
   GENERATE CARD
========================= */

function generateCard() {

    /*
        Later in the game,
        slightly higher cards
        can appear.
    */


    const random =
        Math.random();


    if (
        score >= 1000 &&
        random < 0.08
    ) {

        return 8;

    }


    if (
        score >= 500 &&
        random < 0.15
    ) {

        return 4;

    }


    const index =
        Math.floor(
            Math.random() *
            BASIC_CARDS.length
        );


    return BASIC_CARDS[index];

}


/* =========================
   RENDER BOARD
========================= */

function renderBoard() {

    gameBoard.innerHTML = "";


    board.forEach(
        (value, index) => {

            const cell =
                document.createElement("div");


            cell.classList.add(
                "board-cell"
            );


            if (value === null) {

                cell.classList.add(
                    "empty"
                );


                cell.addEventListener(
                    "click",
                    () => {

                        placeCard(index);

                    }
                );

            } else {

                const card =
                    document.createElement(
                        "div"
                    );


                card.classList.add(
                    "card"
                );


                card.dataset.value =
                    value;


                card.textContent =
                    value;


                cell.appendChild(card);

            }


            gameBoard.appendChild(cell);

        }
    );

}


/* =========================
   PLACE CARD
========================= */

function placeCard(index) {

    if (!gameActive) {
        return;
    }


    if (board[index] !== null) {
        return;
    }


    /*
        Place current card.
    */

    board[index] =
        currentCard;


    /*
        Remember which card
        was placed.
    */

    const placedValue =
        currentCard;


    /*
        Prepare next card.
    */

    currentCard =
        nextCard;

    nextCard =
        generateCard();


    /*
        Reset combo before
        checking combinations.
    */

    combo = 0;


    /*
        First check whether
        the newly placed card
        can combine.
    */

    const combined =
        tryCombine(index);


    if (!combined) {

        combo = 0;

        gameMessage.textContent =
            `Placed ${placedValue} ✨`;

    }


    updateScore();

    updateNextCard();

    renderBoard();


    /*
        Check if the game
        has ended.
    */

    if (isGameOver()) {

        endGame();

    }

}


/* =========================
   COMBINE
========================= */

function tryCombine(index) {

    let combinedSomething =
        false;


    while (true) {

        const value =
            board[index];


        if (value === null) {
            break;
        }


        /*
            Find another card
            with the same value.
        */

        const matchingIndex =
            findMatchingCard(
                index,
                value
            );


        if (matchingIndex === -1) {

            break;

        }


        /*
            Combine the cards.
        */

        const newValue =
            value * 2;


        board[index] =
            newValue;


        board[matchingIndex] =
            null;


        /*
            Add score.
        */

        const points =
            newValue;


        score += points;


        combo++;

        combinedSomething = true;


        /*
            Small visual effect.
        */

        gameMessage.textContent =
            `✨ ${value} + ${value} = ${newValue}!`;


        /*
            If the new card can
            immediately combine again,
            the loop continues.
        */

    }


    if (combinedSomething) {

        if (combo >= 2) {

            gameMessage.textContent =
                `🔥 COMBO ×${combo}!`;

        } else {

            gameMessage.textContent =
                `✨ Combined!`;

        }

    }


    return combinedSomething;

}


/* =========================
   FIND MATCHING CARD
========================= */

function findMatchingCard(
    index,
    value
) {

    /*
        For this game,
        cards combine if they
        are directly connected
        horizontally or vertically.
    */


    const row =
        Math.floor(
            index / BOARD_SIZE
        );


    const column =
        index % BOARD_SIZE;


    const neighbours = [];


    /*
        Up
    */

    if (row > 0) {

        neighbours.push(
            index - BOARD_SIZE
        );

    }


    /*
        Down
    */

    if (
        row <
        BOARD_SIZE - 1
    ) {

        neighbours.push(
            index + BOARD_SIZE
        );

    }


    /*
        Left
    */

    if (column > 0) {

        neighbours.push(
            index - 1
        );

    }


    /*
        Right
    */

    if (
        column <
        BOARD_SIZE - 1
    ) {

        neighbours.push(
            index + 1
        );

    }


    /*
        Shuffle neighbours
        so the game doesn't always
        favour one direction.
    */

    neighbours.sort(
        () => Math.random() - 0.5
    );


    for (
        const neighbour of neighbours
    ) {

        if (
            board[neighbour] ===
            value
        ) {

            return neighbour;

        }

    }


    return -1;

}


/* =========================
   UPDATE SCORE
========================= */

function updateScore() {

    scoreDisplay.textContent =
        score;


    if (score > bestScore) {

        bestScore =
            score;


        localStorage.setItem(
            "cardCombineBestScore",
            bestScore
        );

    }


    bestScoreDisplay.textContent =
        bestScore;


    comboDisplay.textContent =
        combo;


    /*
        Combo animation.
    */

    if (combo > 0) {

        comboDisplay.classList.remove(
            "combo-active"
        );


        void comboDisplay.offsetWidth;


        comboDisplay.classList.add(
            "combo-active"
        );

    }

}


/* =========================
   NEXT CARD
========================= */

function updateNextCard() {

    nextCardDisplay.textContent =
        nextCard;

}


/* =========================
   EMPTY CELLS
========================= */

function getEmptyCells() {

    const emptyCells = [];


    board.forEach(
        (value, index) => {

            if (value === null) {

                emptyCells.push(
                    index
                );

            }

        }
    );


    return emptyCells;

}


/* =========================
   GAME OVER CHECK
========================= */

function isGameOver() {

    /*
        If there is an empty
        space, the player can
        still place a card.
    */

    if (
        board.some(
            value => value === null
        )
    ) {

        return false;

    }


    /*
        Board is full.

        Check whether there
        are any neighbouring
        matching cards.

        If there are, the player
        can still combine them.
    */

    for (
        let index = 0;
        index < TOTAL_CELLS;
        index++
    ) {

        const value =
            board[index];


        const matching =
            findMatchingCard(
                index,
                value
            );


        if (matching !== -1) {

            return false;

        }

    }


    return true;

}


/* =========================
   GAME OVER
========================= */

function endGame() {

    gameActive = false;


    gameMessage.textContent =
        "GAME OVER 💔";


    gameBoard.classList.add(
        "game-over"
    );

}


/* =========================
   RESTART
========================= */

restartButton.addEventListener(
    "click",
    () => {

        gameBoard.classList.remove(
            "game-over"
        );


        startGame();

    }
);


/* =========================
   START
========================= */

startGame();
