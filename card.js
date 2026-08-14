/* =========================================================
   CARD COMBINE 🃏
   2048 STYLE
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const gameBoard =
    document.getElementById("gameBoard");

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


/* =========================================================
   SETTINGS
========================================================= */

const SIZE = 4;

const CELLS =
    SIZE * SIZE;


/* =========================================================
   GAME STATE
========================================================= */

let board =
    Array(CELLS).fill(0);

let score = 0;

let bestScore =
    Number(
        localStorage.getItem(
            "cardCombineBestScore"
        )
    ) || 0;

let combo = 0;

let gameActive = true;

let isAnimating = false;

let nextCard = 2;


/* =========================================================
   MUSIC
========================================================= */

const backgroundMusic =
    new Audio("audio/game.mp3");

backgroundMusic.loop = true;

backgroundMusic.volume = 0.25;

let musicEnabled = true;


if (musicButton) {

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

}


/*
    Try to start music after
    the first user interaction.
*/

document.addEventListener(
    "click",
    startMusicOnce,
    {
        once: true
    }
);


function startMusicOnce() {

    if (!musicEnabled) {
        return;
    }

    backgroundMusic
        .play()
        .then(() => {

            if (musicButton) {

                musicButton.textContent =
                    "🎵 Music On";

            }

        })
        .catch(() => {});

}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    board =
        Array(CELLS).fill(0);

    score = 0;

    combo = 0;

    gameActive = true;

    isAnimating = false;

    nextCard =
        generateCard();


    gameBoard.classList.remove(
        "moving"
    );

    gameBoard.classList.remove(
        "game-over"
    );


    /*
        Starting cards.
    */

    spawnCard();

    spawnCard();


    updateScore();

    updateNextCard();

    renderBoard();


    gameMessage.textContent =
        "Swipe or use the arrow keys ✨";

}


/* =========================================================
   GENERATE CARD
========================================================= */

function generateCard() {

    const highest =
        getHighestCard();

    const roll =
        Math.random();


    /*
        --------------------------------
        EARLY GAME
        Mostly 2 and 4
        --------------------------------
    */

    if (highest <= 4) {

        if (roll < 0.88) {

            return 2;

        }

        return 4;

    }


    /*
        --------------------------------
        HIGHEST = 8
        --------------------------------
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
        --------------------------------
        HIGHEST = 16
        --------------------------------
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
        --------------------------------
        HIGHEST = 32
        --------------------------------
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
        --------------------------------
        HIGHEST = 64
        --------------------------------
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
        --------------------------------
        HIGHEST = 128+
        --------------------------------

        2, 4, 8, 16 and 32
        remain common.

        Higher cards become rare.
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
        Add higher cards gradually.
    */

    let value = 64;


    while (
        value <= maxSpawn
    ) {

        possibleCards.push(
            value
        );

        value *= 2;

    }


    /*
        Weighted random system.
    */

    const weightedCards = [];


    possibleCards.forEach(
        card => {

            let weight;


            if (card <= 4) {

                weight = 30;

            }

            else if (card === 8) {

                weight = 18;

            }

            else if (card === 16) {

                weight = 10;

            }

            else if (card === 32) {

                weight = 5;

            }

            else {

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

                weightedCards.push(
                    card
                );

            }

        }
    );


    return weightedCards[
        Math.floor(
            Math.random() *
            weightedCards.length
        )
    ];

}


/* =========================================================
   GET HIGHEST CARD
========================================================= */

function getHighestCard() {

    return Math.max(
        ...board,
        2
    );

}


/* =========================================================
   SPAWN CARD
========================================================= */

let nextCard = getRandomSpawnValue();

function getRandomSpawnValue() {

    const random = Math.random();

    if (random < 0.70) {
        return 2;
    }

    if (random < 0.90) {
        return 4;
    }

    return 8;
}


function spawnCard() {

    const emptyCells = [];

    for (let i = 0; i < board.length; i++) {

        if (board[i] === 0) {
            emptyCells.push(i);
        }

    }

    if (emptyCells.length === 0) {
        return false;
    }


    const randomIndex =
        emptyCells[
            Math.floor(
                Math.random() *
                emptyCells.length
            )
        ];


    // Spawn the card that was being displayed
    board[randomIndex] = nextCard;


    // Immediately choose the NEXT card
    nextCard = getRandomSpawnValue();


    updateNextCard();


    return true;
}

/* =========================================================
   RENDER BOARD
========================================================= */

function renderBoard() {

    gameBoard.innerHTML = "";


    board.forEach(
        (value, index) => {

            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "board-cell";


            cell.dataset.index =
                index;


            if (
                value !== 0
            ) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "card";


                card.dataset.value =
                    value;


                card.textContent =
                    value;


                cell.appendChild(
                    card
                );

            } else {

                cell.classList.add(
                    "empty"
                );

            }


            gameBoard.appendChild(
                cell
            );

        }
    );

}


/* =========================================================
   MOVE
========================================================= */

function move(direction) {

    if (!gameActive) {
        return;
    }


    if (isAnimating) {
        return;
    }


    isAnimating = true;

    gameBoard.classList.add(
        "moving"
    );


    /*
        Save the board before
        the move.
    */

    const oldBoard =
        [...board];


    /*
        Calculate movement.
    */

    const movement =
        calculateMove(
            direction
        );


    /*
        NOTHING MOVED
        --------------------------------
        But your custom rule says
        a card MUST still spawn.
    */

    if (
        !movement.changed
    ) {

        const boardBeforeSpawn =
            [...board];


        spawnCard();


        const boardAfterSpawn =
            [...board];


        combo = 0;


        gameMessage.textContent =
            "A new card appeared 🃏";


        updateScore();

        updateNextCard();

        renderBoard();


        animateNewCard(
            boardBeforeSpawn,
            boardAfterSpawn
        );


        isAnimating = false;

        gameBoard.classList.remove(
            "moving"
        );


        if (
            isGameOver()
        ) {

            endGame();

        }


        return;

    }


    /*
        Keep OLD board visible
        during animation.
    */

    board =
        oldBoard;


    renderBoard();


    /*
        Animate cards.
    */

    animateMovement(
        movement
    );

}


/* =========================================================
   CALCULATE MOVE
========================================================= */

function calculateMove(direction) {

    const newBoard =
        Array(CELLS).fill(0);

    const movements = [];

    let changed = false;

    let merged = 0;


    const lines =
        getLines(
            direction
        );


    lines.forEach(
        line => {

            const cards = [];


            /*
                Collect cards.
            */

            line.forEach(
                index => {

                    if (
                        board[index] !== 0
                    ) {

                        cards.push({
                            value:
                                board[index],

                            from:
                                index
                        });

                    }

                }
            );


            let target =
                0;


            /*
                Process cards.
            */

            for (
                let i = 0;
                i < cards.length;
                i++
            ) {

                const current =
                    cards[i];


                /*
                    MERGE
                */

                if (
                    i + 1 <
                    cards.length &&

                    current.value ===
                    cards[i + 1].value
                ) {

                    const next =
                        cards[i + 1];


                    const destination =
                        line[target];


                    const mergedValue =
                        current.value * 2;


                    movements.push({

                        from:
                            current.from,

                        to:
                            destination,

                        value:
                            current.value,

                        merge:
                            true,

                        mergedValue:
                            mergedValue

                    });


                    movements.push({

                        from:
                            next.from,

                        to:
                            destination,

                        value:
                            next.value,

                        merge:
                            true,

                        mergedValue:
                            mergedValue

                    });


                    newBoard[
                        destination
                    ] =
                        mergedValue;


                    score +=
                        mergedValue;


                    merged++;

                    changed = true;


                    /*
                        Skip second
                        card.
                    */

                    i++;


                    target++;

                }


                /*
                    NORMAL MOVE
                */

                else {

                    const destination =
                        line[target];


                    movements.push({

                        from:
                            current.from,

                        to:
                            destination,

                        value:
                            current.value,

                        merge:
                            false

                    });


                    newBoard[
                        destination
                    ] =
                        current.value;


                    if (
                        current.from !==
                        destination
                    ) {

                        changed = true;

                    }


                    target++;

                }

            }

        }
    );


    return {

        board:
            newBoard,

        movements:
            movements,

        changed:
            changed,

        merged:
            merged

    };

}


/* =========================================================
   ANIMATE MOVEMENT
========================================================= */

function animateMovement(movement) {

    const cells =
        [...gameBoard.children];

    const boardRect =
        gameBoard.getBoundingClientRect();

    const movingCards = [];


    /*
        Hide the original cards.
        The cells remain visible.
    */

    cells.forEach(cell => {

        const originalCard =
            cell.querySelector(".card");

        if (originalCard) {

            originalCard.classList.add(
                "card-moving-hidden"
            );

        }

    });


    /*
        Create temporary cards
        at their ORIGINAL positions.
    */

    movement.movements.forEach(item => {

        const sourceCell =
            cells[item.from];

        if (!sourceCell) {
            return;
        }


        const sourceCard =
            sourceCell.querySelector(".card");

        if (!sourceCard) {
            return;
        }


        const sourceRect =
            sourceCard.getBoundingClientRect();


        const card =
            document.createElement("div");

        card.className =
            "moving-card";


        card.textContent =
            item.value;


        card.style.width =
            `${sourceRect.width}px`;

        card.style.height =
            `${sourceRect.height}px`;


        card.style.left =
            `${sourceRect.left - boardRect.left}px`;

        card.style.top =
            `${sourceRect.top - boardRect.top}px`;


        /*
            Give it the same number
            styling as the original card.
        */

        card.dataset.value =
            item.value;


        gameBoard.appendChild(card);


        movingCards.push({

            element: card,

            item: item

        });

    });


    /*
        Force browser to recognise
        the starting position.
    */

    void gameBoard.offsetWidth;


    /*
        Move cards.
    */

    requestAnimationFrame(() => {

        movingCards.forEach(moving => {

            const item =
                moving.item;


            const startCell =
                cells[item.from];

            const endCell =
                cells[item.to];


            if (
                !startCell ||
                !endCell
            ) {
                return;
            }


            const start =
                startCell.getBoundingClientRect();

            const end =
                endCell.getBoundingClientRect();


            const x =
                end.left - start.left;

            const y =
                end.top - start.top;


            moving.element.style.transform =
                `translate(${x}px, ${y}px)`;

        });

    });


    /*
        Finish animation.
    */

    setTimeout(() => {

        /*
            Remove temporary cards.
        */

        movingCards.forEach(moving => {

            moving.element.remove();

        });


        /*
            Apply the final board.
        */

        board =
            movement.board;


        /*
            Remember board before
            spawning.
        */

        const boardBeforeSpawn =
            [...board];


        /*
            Spawn every turn.
        */

        spawnCard();


        /*
            Remember board after
            spawning.
        */

        const boardAfterSpawn =
            [...board];


        /*
            Combo.
        */

        if (
            movement.merged > 0
        ) {

            combo =
                movement.merged;

            gameMessage.textContent =
                `✨ COMBO ×${combo}!`;

        } else {

            combo = 0;

            gameMessage.textContent =
                "Cards shifted ✨";

        }


        updateScore();

        updateNextCard();


        /*
            Render the REAL final board.
        */

        renderBoard();


        /*
            Merge animation.
        */

        animateMergedCards(
            movement
        );


        /*
            New card animation.
        */

        animateNewCard(
            boardBeforeSpawn,
            boardAfterSpawn
        );


        isAnimating = false;

        gameBoard.classList.remove(
            "moving"
        );


        /*
            Check game over.
        */

        if (
            isGameOver()
        ) {

            endGame();

        }

    }, 180);

}

/* =========================================================
   MERGE ANIMATION
========================================================= */

function animateMergedCards(
    movement
) {

    const mergedIndexes = [];


    movement.movements.forEach(
        item => {

            if (
                item.merge
            ) {

                if (
                    !mergedIndexes.includes(
                        item.to
                    )
                ) {

                    mergedIndexes.push(
                        item.to
                    );

                }

            }

        }
    );


    mergedIndexes.forEach(
        index => {

            const cell =
                gameBoard.children[
                    index
                ];


            if (!cell) {
                return;
            }


            const card =
                cell.querySelector(
                    ".card"
                );


            if (!card) {
                return;
            }


            card.classList.add(
                "merged-card"
            );

        }
    );

}


/* =========================================================
   NEW CARD ANIMATION
========================================================= */

function animateNewCard(
    oldBoard,
    newBoard
) {

    for (
        let i = 0;
        i < CELLS;
        i++
    ) {

        if (
            oldBoard[i] === 0 &&
            newBoard[i] !== 0
        ) {

            const cell =
                gameBoard.children[
                    i
                ];


            if (!cell) {
                continue;
            }


            const card =
                cell.querySelector(
                    ".card"
                );


            if (card) {

                card.classList.add(
                    "new-card"
                );

            }


            /*
                Only one card is spawned
                per turn.
            */

            break;

        }

    }

}


/* =========================================================
   GET LINES
========================================================= */

function getLines(
    direction
) {

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


            lines.push(
                line
            );

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
                let col =
                    SIZE - 1;
                col >= 0;
                col--
            ) {

                line.push(
                    row * SIZE + col
                );

            }


            lines.push(
                line
            );

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


            lines.push(
                line
            );

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
                let row =
                    SIZE - 1;
                row >= 0;
                row--
            ) {

                line.push(
                    row * SIZE + col
                );

            }


            lines.push(
                line
            );

        }

    }


    return lines;

}


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

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


/* =========================================================
   MOBILE SWIPE
========================================================= */

let touchStartX = 0;

let touchStartY = 0;

let touchStartTime = 0;


gameBoard.addEventListener(
    "touchstart",
    event => {

        const touch =
            event.changedTouches[0];


        touchStartX =
            touch.clientX;


        touchStartY =
            touch.clientY;


        touchStartTime =
            Date.now();

    },
    {
        passive: false
    }
);


gameBoard.addEventListener(
    "touchmove",
    event => {

        /*
            Prevent browser scrolling
            and pull-to-refresh.
        */

        event.preventDefault();

    },
    {
        passive: false
    }
);


gameBoard.addEventListener(
    "touchend",
    event => {

        const touch =
            event.changedTouches[0];


        const deltaX =
            touch.clientX -
            touchStartX;


        const deltaY =
            touch.clientY -
            touchStartY;


        const distance =
            Math.max(
                Math.abs(deltaX),
                Math.abs(deltaY)
            );


        const duration =
            Date.now() -
            touchStartTime;


        /*
            Ignore tiny movement.
        */

        if (
            distance < 30
        ) {

            return;

        }


        /*
            Ignore extremely long
            accidental touches.
        */

        if (
            duration > 1000
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

    },
    {
        passive: false
    }
);


/* =========================================================
   SCORE
========================================================= */

function updateScore() {

    if (scoreDisplay) {

        scoreDisplay.textContent =
            score;

    }


    /*
        Save best score.
    */

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


    if (bestScoreDisplay) {

        bestScoreDisplay.textContent =
            bestScore;

    }


    if (comboDisplay) {

        comboDisplay.textContent =
            combo;

    }

}


/* =========================================================
   NEXT CARD
========================================================= */

function updateNextCard() {

    if (
        nextCardDisplay
    ) {

        nextCardDisplay.textContent =
            nextCard;

    }

}


/* =========================================================
   GAME OVER CHECK
========================================================= */

function isGameOver() {

    /*
        If there is an empty cell,
        the game can continue.
    */

    if (
        board.includes(0)
    ) {

        return false;

    }


    /*
        Check horizontal matches.
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
        Check vertical matches.
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


/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

    gameActive = false;

    isAnimating = false;


    gameBoard.classList.remove(
        "moving"
    );


    gameBoard.classList.add(
        "game-over"
    );


    gameMessage.textContent =
        `Game Over 💔 Score: ${score}`;

}


/* =========================================================
   RESTART
========================================================= */

if (restartButton) {

    restartButton.addEventListener(
        "click",
        () => {

            startGame();

        }
    );

}


/* =========================================================
   START
========================================================= */

startGame();
