let currentRound = 1;
let stonePosition = null;
let gameState = 'ready'; // ready, throwing, hopUp, hopDown, won, gameOver
let currentPosition = 0;
let visitedTiles = [];
let direction = 'up'; // up or down
let lives = 3;
let gameTimer = null;
let roundTimer = null;
let roundTimeLimit = 60; // 60 seconds per round
let gameStartTime = null;

function showPopup(icon, header, message, type = 'default') {
    const overlay = document.getElementById('popupOverlay');
    const popup = document.getElementById('popup');
    const popupIcon = document.getElementById('popupIcon');
    const popupHeader = document.getElementById('popupHeader');
    const popupMessage = document.getElementById('popupMessage');
    const popupButton = document.getElementById('popupButton');

    // Reset classes
    popup.className = 'popup';
    popupButton.className = 'popup-button';

    // Set content
    popupIcon.textContent = icon;
    popupHeader.textContent = header;
    popupMessage.innerHTML = message;

    // Apply type-specific styling
    switch (type) {
        case 'success':
            popup.classList.add('success');
            popupButton.classList.add('success');
            break;
        case 'warning':
            popup.classList.add('warning');
            popupButton.classList.add('warning');
            break;
        case 'danger':
            popup.classList.add('danger');
            popupButton.classList.add('danger');
            break;
        case 'victory':
            popup.classList.add('victory');
            popupButton.classList.add('success');
            break;
    }

    overlay.style.display = 'flex';
}

function closePopup() {
    const overlay = document.getElementById('popupOverlay');
    overlay.style.display = 'none';
}

// Close popup when clicking overlay
document.getElementById('popupOverlay').addEventListener('click', function (e) {
    if (e.target === this) {
        closePopup();
    }
});

function updateGameStatus(message) {
    document.getElementById('gameStatus').textContent = message;
}

function startGameTimer() {
    if (gameTimer) clearInterval(gameTimer);
    gameStartTime = Date.now();
    gameTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timer').textContent =
            `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function startRoundTimer() {
    if (roundTimer) clearInterval(roundTimer);
    let timeLeft = roundTimeLimit;

    roundTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(roundTimer);
            loseLife("Time's up! ⏰");
        }
    }, 1000);
}

function stopRoundTimer() {
    if (roundTimer) {
        clearInterval(roundTimer);
        roundTimer = null;
    }
}

function loseLife(reason) {
    lives--;
    updateLivesDisplay();
    stopRoundTimer();

    if (lives <= 0) {
        gameState = 'gameOver';
        clearInterval(gameTimer);
        updateGameStatus("Game Over! Click Reset to try again.");
        document.getElementById('throwBtn').disabled = true;
        setTimeout(() => {
            showPopup(
                '💀',
                'Game Over!',
                `${reason}<br><br><strong>You made it to Round ${currentRound}</strong><br>Try again!`,
                'danger'
            );
        }, 100);
    } else {
        setTimeout(() => {
            showPopup(
                '💔',
                'Oops!',
                `${reason}<br><br><strong>Lives remaining: ${lives}</strong>`,
                'warning'
            );
            resetRound();
        }, 100);
    }
}

function updateLivesDisplay() {
    const heartsContainer = document.getElementById('lives');
    const hearts = heartsContainer.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        if (index < lives) {
            heart.classList.remove('lost');
        } else {
            heart.classList.add('lost');
        }
    });
}

function throwStone() {
    if (gameState !== 'ready') return;

    if (!gameStartTime) {
        startGameTimer();
    }

    // Remove previous stone and visited tiles
    document.querySelectorAll('.tile').forEach(tile => {
        tile.classList.remove('stone', 'current', 'visited');
    });

    // Place stone on current round number
    stonePosition = currentRound;
    const stoneTile = document.querySelector(`[data-number="${stonePosition}"]`);
    if (stoneTile) {
        stoneTile.classList.add('stone');
    }

    updateStoneIndicator();
    gameState = 'hopUp';
    currentPosition = 0;
    visitedTiles = [];
    direction = 'up';

    startRoundTimer();
    updateCurrentTile();
    updateGameStatus("Hop to the orange tile! Skip the purple stone!");
    document.getElementById('throwBtn').disabled = true;
}

function updateStoneIndicator() {
    const indicator = document.getElementById('stoneIndicator');
    indicator.textContent = stonePosition ? `Stone on: ${stonePosition}` : 'Stone on: None';
}

function updateCurrentTile() {
    document.querySelectorAll('.tile').forEach(tile => {
        tile.classList.remove('current');
    });

    let nextTile;
    if (direction === 'up') {
        nextTile = getNextValidTile(currentPosition + 1);
    } else { // direction === 'down'
        nextTile = getNextValidTile(currentPosition - 1);
    }

    if (nextTile >= 0 && nextTile <= 10) {
        const currentTile = document.querySelector(`[data-number="${nextTile}"]`);
        if (currentTile && !currentTile.classList.contains('stone')) {
            currentTile.classList.add('current');
        }
    }
}

function getNextValidTile(targetTile) {
    if (direction === 'up') {
        // Going up: skip stone tile, continue to next
        while (targetTile <= 10 && targetTile === stonePosition) {
            targetTile++;
        }
        return targetTile <= 10 ? targetTile : -1;
    } else {
        // Going down: skip stone tile, continue to previous
        while (targetTile >= 0 && targetTile === stonePosition) {
            targetTile--;
        }
        return targetTile >= 0 ? targetTile : -1;
    }
}

function updateVisitedTiles() {
    visitedTiles.forEach(num => {
        const tile = document.querySelector(`[data-number="${num}"]`);
        if (tile && !tile.classList.contains('stone') && !tile.classList.contains('current')) {
            tile.classList.add('visited');
        }
    });
}

// Add click event listeners to tiles
document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', function () {
        if (gameState !== 'hopUp' && gameState !== 'hopDown') return;

        const tileNumber = parseInt(this.dataset.number);

        // Check if this is a valid move
        if (tileNumber === stonePosition) {
            loseLife("You stepped on the stone! 🪨");
            return;
        }

        // Determine what the next valid tile should be
        let expectedTile;
        if (direction === 'up') {
            expectedTile = getNextValidTile(currentPosition + 1);
        } else {
            expectedTile = getNextValidTile(currentPosition - 1);
        }

        if (tileNumber !== expectedTile) {
            loseLife(`Wrong move! Expected tile ${expectedTile} 🚫`);
            return;
        }

        // Valid move
        if (currentPosition >= 0) {
            visitedTiles.push(currentPosition);
        }
        currentPosition = tileNumber;
        updateVisitedTiles();

        // Check game progression
        if (direction === 'up') {
            if (currentPosition === 10) {
                // Reached the end, now go back down
                direction = 'down';
                gameState = 'hopDown';
                updateGameStatus("Now hop back to START! Skip the stone!");
                updateCurrentTile();
            } else {
                updateCurrentTile();
            }
        } else { // direction === 'down'
            if (currentPosition === 0) {
                // Completed the round - reached starting stone
                stopRoundTimer();
                setTimeout(() => {
                    showPopup(
                        '🎉',
                        `Round ${currentRound} Complete!`,
                        'Well done! Get ready for the next round.',
                        'success'
                    );
                    currentRound++;

                    if (currentRound > 10) {
                        clearInterval(gameTimer);
                        const finalTime = document.getElementById('timer').textContent;
                        updateGameStatus("🏆 VICTORY! You're a hopscotch champion!");
                        setTimeout(() => {
                            showPopup(
                                '🏆',
                                'VICTORY!',
                                `You've mastered Winter Hopscotch!<br><br><strong>Final ${finalTime}</strong><br><strong>Lives remaining: ${lives}/3</strong><br><br>You're a hopscotch champion! ❄️`,
                                'victory'
                            );
                        }, 500);
                        gameState = 'won';
                    } else {
                        resetRound();
                    }
                }, 500);
            } else {
                updateCurrentTile();
            }
        }
    });
});

function resetRound() {
    gameState = 'ready';
    currentPosition = 0;
    stonePosition = null;
    visitedTiles = [];
    direction = 'up';
    stopRoundTimer();

    document.querySelectorAll('.tile').forEach(tile => {
        tile.classList.remove('stone', 'current', 'visited');
    });

    updateStoneIndicator();
    document.getElementById('currentTurn').textContent = currentRound;
    document.getElementById('throwBtn').disabled = false;
    updateGameStatus("Click 'Throw Stone' to start the next round!");
}

function resetGame() {
    currentRound = 1;
    lives = 3;
    gameStartTime = null;
    clearInterval(gameTimer);
    clearInterval(roundTimer);
    updateLivesDisplay();
    document.getElementById('timer').textContent = 'Time: 00:00';
    document.getElementById('throwBtn').disabled = false;
    updateGameStatus("Click 'Throw Stone' to start!");
    resetRound();
    closePopup(); // Close any open popups
}

// Initialize the display
updateStoneIndicator();
updateLivesDisplay();
updateGameStatus("Click 'Throw Stone' to start!");