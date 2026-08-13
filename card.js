/* =========================
   CARD COMBINE 🃏
   2048 STYLE
========================= */

const gameBoard = document.getElementById("gameBoard");
const scoreDisplay = document.getElementById("score");
const bestScoreDisplay = document.getElementById("bestScore");
const comboDisplay = document.getElementById("combo");
const nextCardDisplay = document.getElementById("nextCard");
const gameMessage = document.getElementById("gameMessage");
const restartButton = document.getElementById("restartButton");
const musicButton = document.getElementById("musicButton");


/* =========================
   SETTINGS
========================= */

const SIZE = 4;
const CELLS = SIZE * SIZE;

const STARTING_CARDS = 2;


/* =========================
   GAME STATE
========================= */

let board = [];

let score = 0;

let bestScore =
    Number(localStorage.getItem("cardCombineBestScore")) || 0;

let combo = 0;

let gameActive = true;

let nextCard = 2;


/* =========================
   MUSIC
========================= */

const backgroundMusic =
    new Audio("audio/game.mp3");

backgroundMusic.loop = true;
backgroundMusic.volume = 0.25;

let musicEnabled = true;


musicButton.addEventListener("click", () => {

    if (musicEnabled) {

        musicEnabled = false;

        backgroundMusic.pause();

        musicButton.textContent =
            "🔇 Music Off";

    } else {

        musicEnabled = true;

        backgroundMusic.play()
            .then(() => {

                musicButton.textContent =
                    "🎵 Music On";

            })
            .catch(() => {

                musicButton.textContent =
                    "🎵 Start Music";

            });

    }

});


/*
    Browser autoplay policies can
    block music until interaction.
*/

document.addEventListener(
    "click",
    startMusicOnce,
    { once: true }
);


function startMusicOnce() {

    if (!musicEnabled) {
        return;
    }

    backgroundMusic.play()
        .then(() => {

            musicButton.textContent =
                "🎵 Music On";

        })
        .catch(() => {});

}


/* =========================
   START GAME
========================= */

function startGame() {

    board =
        Array(CELLS).fill(0);

    score = 0;

    combo = 0;

    gameActive = true;

    nextCard = generateCard();


    scoreDisplay.textContent =
        score;

    bestScoreDisplay.textContent =
        bestScore;

    comboDisplay.textContent =
        combo;


    /*
        Start with two cards.
    */

    spawnCard();

    spawnCard();


    updateNextCard();

    renderBoard();


    gameMessage.textContent =
        "Swipe or use the arrow keys ✨";

}


/* =========================
   GENERATE CARD
========================= */

/*
    The spawn system changes
    according to the highest
    card currently on the board.

    Small cards remain common.

    Larger cards become possible
    as the board gets stronger.
*/

function generateCard() {

    const highest =
        getHighestCard();


    const roll =
        Math.random();


    /*
        EARLY GAME
        Mostly 2 and 4.
    */

    if (highest <= 4) {

        if (roll < 0.88) {
            return 2;
        }

        return 4;

    }


    /*
        HIGHEST = 8
    */

    if (highest <= 8) {

        if (roll < 0.65) {
            return 2;
        }

        if (roll < 0.92) {
            return 4;
        }

        return 8;

    }


    /*
        HIGHEST = 16
    */

    if (highest <= 16) {

        if (roll < 0.52) {
            return 2;
        }

        if (roll < 0.82) {
            return 4;
        }

        if (roll < 0.96) {
            return 8;
        }

        return 16;

    }


    /*
        HIGHEST = 32
    */

    if (highest <= 32) {

        if (roll < 0.42) {
            return 2;
        }

        if (roll < 0.68) {
            return 4;
        }

        if (roll < 0.88) {
            return 8;
        }

        if (roll < 0.98) {
            return 16;
        }

        return 32;

    }


    /*
        HIGHEST = 64
    */

    if (highest <= 64) {

        if (roll < 0.36) {
            return 2;
        }

        if (roll < 0.59) {
            return 4;
        }

        if (roll < 0.79) {
            return 8;
        }

        if (roll < 0.93) {
            return 16;
        }

        if (roll < 0.99) {
            return 32;
        }

        return 64;

    }


    /*
        HIGHEST = 128+
        
        Keep 2, 4, 8, 16 and 32
        as the main cards.

        Higher cards remain rare.
    */

    const maxSpawn =
        highest;


    const possibleCards = [
        2,
        4,
        8,
        16,
        32
    ];


    /*
        Add larger cards based
        on the board's highest card.
    */

    let value = 64;

    while (
        value <= maxSpawn
    ) {

        possibleCards.push(value);

        value *= 2;

    }


    /*
        Weighted random selection.

        Smaller cards have much
        greater weight.
    */

    const weightedCards = [];


    possibleCards.forEach(card => {

        let weight;


        if (card <= 4) {

            weight = 30;

        } else if (card === 8) {

            weight = 18;

        } else if (card === 16) {

            weight = 10;

        } else if (card === 32) {

            weight = 5;

        } else {

            /*
                Higher cards become
                increasingly rare.
            */

            weight =
                Math.max(
                    1,
                    8 -
                    Math.log2(card)
                );

        }


        for (
            let i = 0;
            i < weight;
            i++
        ) {

            weightedCards.push(card);

        }

    });


    return weightedCards[
        Math.floor(
            Math.random() *
            weightedCards.length
        )
    ];

}


/* =========================
   HIGHEST CARD
========================= */

function getHighestCard() {

    return Math.max(
        ...board,
        2
    );

}


/* =========================
   SPAWN CARD
========================= */

function spawnCard() {

    const emptyCells = [];


    board.forEach(
        (value, index) => {

            if (value === 0) {

                emptyCells.push(index);

            }

        }
    );


    /*
        No space.
    */

    if (
        emptyCells.length === 0
    ) {

        return false;

    }


    const randomIndex =
        Math.floor(
            Math.random() *
            emptyCells.length
        );


    const position =
        emptyCells[randomIndex];


    /*
        Use the prepared
        next card.
    */

    board[position] =
        nextCard;


    /*
        Prepare another card
        for the next spawn.
    */

    nextCard =
        generateCard();


    return true;

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


            cell.className =
                "board-cell";


            if (value !== 0) {

                const card =
                    document.createElement("div");


                card.className =
                    "card";


                card.dataset.value =
                    value;


                card.textContent =
                    value;


                cell.appendChild(card);

            } else {

                cell.classList.add(
                    "empty"
                );

            }


            gameBoard.appendChild(cell);

        }
    );

}


/* =========================
   MOVE BOARD
========================= */

function move(direction) {

    if (!gameActive) {
        return;
    }


    let moved = false;

    let totalMerged = 0;


    /*
        Convert board into rows
        depending on direction.
    */

    const lines =
        getLines(direction);


    const newBoard =
        Array(CELLS).fill(0);


    lines.forEach(
        (line, lineIndex) => {

            const values =
                line.map(
                    index =>
                        board[index]
                );


            const result =
                slideAndMerge(values);


            /*
                Put result back into
                the correct positions.
            */

            result.values.forEach(
                (value, position) => {

                    newBoard[
                        line[position]
                    ] = value;

                }
            );


            if (result.moved) {

                moved = true;

            }


            totalMerged +=
                result.merged;

        }
    );


    board =
        newBoard;


    /*
        Combo is based on how
        many combinations happened.
    */

    if (totalMerged > 0) {

        combo =
            totalMerged;

        gameMessage.textContent =
            `✨ COMBO ×${combo}!`;

    } else {

        combo = 0;

        gameMessage.textContent =
            "Cards shifted ✨";

    }


    /*
        IMPORTANT:
        A new card ALWAYS spawns
        after every swipe.

        Even if nothing moved.
    */

    spawnCard();


    updateScore();

    updateNextCard();

    renderBoard();


    /*
        Check game over AFTER
        the new card appears.
    */

    if (isGameOver()) {

        endGame();

    }

}


/* =========================
   SLIDE + MERGE
========================= */

function slideAndMerge(values) {

    /*
        Remove empty spaces.
    */

    const filtered =
        values.filter(
            value => value !== 0
        );


    const result = [];

    let merged = 0;


    for (
        let i = 0;
        i < filtered.length;
        i++
    ) {

        /*
            If the next card is
            identical, combine them.
        */

        if (
            filtered[i] ===
            filtered[i + 1]
        ) {

            const newValue =
                filtered[i] * 2;


            result.push(
                newValue
            );


            score +=
                newValue;


            merged++;

            i++;

        } else {

            result.push(
                filtered[i]
            );

        }

    }


    /*
        Restore empty spaces.
    */

    while (
        result.length <
        SIZE
    ) {

        result.push(0);

    }


    /*
        Check whether the line
        actually changed.
    */

    const moved =
        result.some(
            (value, index) =>
                value !== values[index]
        );


    return {
        values: result,
        moved: moved,
        merged: merged
    };

}


/* =========================
   GET LINES
========================= */

function getLines(direction) {

    const lines = [];


    /*
        LEFT
    */

    if (
        direction === "left"
    ) {

        for (
            let row = 0;
            row < SIZE;
            row++
        ) {

            const line = [];


            for (
                let col = 0;
                col < SIZE;
                col++
            ) {

                line.push(
                    row * SIZE + col
                );

            }


            lines.push(line);

        }

    }


    /*
        RIGHT
    */

    else if (
        direction === "right"
    ) {

        for (
            let row = 0;
            row < SIZE;
            row++
        ) {

            const line = [];


            for (
                let col = SIZE - 1;
                col >= 0;
                col--
            ) {

                line.push(
                    row * SIZE + col
                );

            }


            lines.push(line);

        }

    }


    /*
        UP
    */

    else if (
        direction === "up"
    ) {

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            const line = [];


            for (
                let row = 0;
                row < SIZE;
                row++
            ) {

                line.push(
                    row * SIZE + col
                );

            }


            lines.push(line);

        }

    }


    /*
        DOWN
    */

    else if (
        direction === "down"
    ) {

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            const line = [];


            for (
                let row = SIZE - 1;
                row >= 0;
                row--
            ) {

                line.push(
                    row * SIZE + col
                );

            }


            lines.push(line);

        }

    }


    return lines;

}


/* =========================
   KEYBOARD CONTROLS
========================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            event.preventDefault();

            move("left");

        }


        else if (
            key === "arrowright" ||
            key === "d"
        ) {

            event.preventDefault();

            move("right");

        }


        else if (
            key === "arrowup" ||
            key === "w"
        ) {

            event.preventDefault();

            move("up");

        }


        else if (
            key === "arrowdown" ||
            key === "s"
        ) {

            event.preventDefault();

            move("down");

        }

    }
);


/* =========================
   MOBILE SWIPE
========================= */

let touchStartX = 0;
let touchStartY = 0;

let touchEndX = 0;
let touchEndY = 0;


gameBoard.addEventListener(
    "touchstart",
    event => {

        const touch =
            event.changedTouches[0];


        touchStartX =
            touch.clientX;

        touchStartY =
            touch.clientY;

    },
    { passive: true }
);


gameBoard.addEventListener(
    "touchend",
    event => {

        const touch =
            event.changedTouches[0];


        touchEndX =
            touch.clientX;

        touchEndY =
            touch.clientY;


        handleSwipe();

    },
    { passive: true }
);


/* =========================
   HANDLE SWIPE
========================= */

function handleSwipe() {

    const deltaX =
        touchEndX -
        touchStartX;


    const deltaY =
        touchEndY -
        touchStartY;


    const minimumSwipe =
        30;


    /*
        Ignore tiny touches.
    */

    if (
        Math.abs(deltaX) <
            minimumSwipe &&
        Math.abs(deltaY) <
            minimumSwipe
    ) {

        return;

    }


    /*
        Horizontal swipe.
    */

    if (
        Math.abs(deltaX) >
        Math.abs(deltaY)
    ) {

        if (
            deltaX > 0
        ) {

            move("right");

        } else {

            move("left");

        }

    }


    /*
        Vertical swipe.
    */

    else {

        if (
            deltaY > 0
        ) {

            move("down");

        } else {

            move("up");

        }

    }

}


/* =========================
   SCORE
========================= */

function updateScore() {

    scoreDisplay.textContent =
        score;


    if (
        score > bestScore
    ) {

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

}


/* =========================
   NEXT CARD
========================= */

function updateNextCard() {

    nextCardDisplay.textContent =
        nextCard;

}


/* =========================
   GAME OVER
========================= */

function isGameOver() {

    /*
        If there is an empty
        cell, the game continues.
    */

    if (
        board.includes(0)
    ) {

        return false;

    }


    /*
        Check horizontal pairs.
    */

    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE - 1;
            col++
        ) {

            const current =
                board[
                    row * SIZE + col
                ];


            const next =
                board[
                    row * SIZE +
                    col + 1
                ];


            if (
                current === next
            ) {

                return false;

            }

        }

    }


    /*
        Check vertical pairs.
    */

    for (
        let row = 0;
        row < SIZE - 1;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            const current =
                board[
                    row * SIZE + col
                ];


            const below =
                board[
                    (row + 1) *
                    SIZE + col
                ];


            if (
                current === below
            ) {

                return false;

            }

        }

    }


    return true;

}


/* =========================
   GAME OVER
========================= */

function endGame() {

    gameActive = false;


    gameBoard.classList.add(
        "game-over"
    );


    gameMessage.textContent =
        `Game Over 💔 Score: ${score}`;

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
