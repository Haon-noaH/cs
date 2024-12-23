// Get all the number elements in the HTML
const cells = document.querySelectorAll(".num");

// Number of cells in a row/column
let boardSize = 6;

// Initialize the board as a 2D array
let board = [];

// Current player (1 or 2)
let currentPlayer = 1;

// Total number of moves
let moveCount = 0;

// Has the game been won?
let win = false;

// Timeout IDs for explosions and processing explosions
let explosionTimeout;
let processExplosionsTimeout;

let timeoutIds = []; // Array to store all timeout IDs

// Is an explosion currently happening?
let explosion = false;

// Initialize the board
function initBoard() {
  // Clear all pending timeouts
  timeoutIds.forEach((id) => clearTimeout(id));
  timeoutIds = [];

  // Reset the board
  board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => ({ player: 0, count: 0 }))
  );

  // Reset all the number elements
  cells.forEach((cell) => {
    cell.innerHTML = "0";
    cell.player = 0;
    cell.count = 0;
  });

  // Reset explosion variables
  explosionQueue = [];
  explosionCount = 0;
  win = false;
  moveCount = 0;
  currentPlayer = 1;
  updateBoard();
}

// Add event listeners to all the number elements
cells.forEach((p, index) => {
  p.addEventListener("click", handleCellClick);
  let indexI = Math.floor(index / boardSize);
  let indexJ = index % boardSize;
  p.dataset.row = indexI;
  p.dataset.col = indexJ;
});

// Handle a cell being clicked
function handleCellClick(event) {
  // If an explosion is happening, don't let the player do anything
  if (explosion) {
    alert("Explosion in progress!");
    return;
  }
  // If the game has been won, don't let the player do anything
  if (win) return;

  // Get the row and column of the clicked cell
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);
  const cell = board[row][col];

  // If the cell is empty, fill it with the current player's blob
  if (cell.player === 0) {
    cell.player = currentPlayer;
    cell.count++;
    moveCount++;
    updateBoard();
    // Switch the current player
    if (currentPlayer === 1) {
      currentPlayer = 2;
      document.getElementById("player").style.color = "green";
      document.getElementById("player").innerHTML = "Player: " + currentPlayer;
    } else {
      currentPlayer = 1;
      document.getElementById("player").style.color = "red";
      document.getElementById("player").innerHTML = "Player: " + currentPlayer;
    }
  } else if (cell.player === currentPlayer) {
    // If the cell is already filled with the current player's blob, increase the count
    cell.count++;
    moveCount++;
    // If the count is equal to the explosion threshold, trigger an explosion
    if (cell.count >= getExplosionThreshold(row, col)) {
      triggerExplosion(row, col, cell.player);
    }
    updateBoard();
    if (!win) {
      // Switch the current player
      if (currentPlayer === 1) {
        currentPlayer = 2;
        document.getElementById("player").style.color = "green";
        document.getElementById("player").innerHTML =
          "Player: " + currentPlayer;
      } else {
        currentPlayer = 1;
        document.getElementById("player").style.color = "red";
        document.getElementById("player").innerHTML =
          "Player: " + currentPlayer;
      }
    }
  } else {
    // If the cell is not empty and not filled with the current player's blob, don't let the player do anything
    alert("This is not your blob. \nYou cannot click it.");
  }
}

// Update the board by updating the number elements
function updateBoard() {
  // If no moves have been made, set the current player to 1
  if (moveCount < 1) {
    document.getElementById("player").style.color = "red";
    document.getElementById("player").innerHTML = "Player: 1";
  }

  // Update all the number elements
  cells.forEach((p, index) => {
    let indexI = Math.floor(index / boardSize);
    let indexJ = index % boardSize;
    pCount = board[indexI][indexJ].count;
    if (board[indexI][indexJ].player === 1) {
      p.src = "red" + pCount + ".png";
    } else if (board[indexI][indexJ].player === 2) {
      p.src = "green" + pCount + ".png";
    } else {
      p.src = "blank.png";
    }
  });
}

// Get the explosion threshold for a given cell
function getExplosionThreshold(row, col) {
  // If the cell is in a corner, the threshold is 2
  if (
    (row === 0 || row === boardSize - 1) &&
    (col === 0 || col === boardSize - 1)
  ) {
    return 2;
    return 2; // Corner cells
  } else if (
    // If the cell is on an edge, the threshold is 3
    row === 0 ||
    row === boardSize - 1 ||
    col === 0 ||
    col === boardSize - 1
  ) {
    return 3;
    return 3; // Edge cells
  } else {
    // Otherwise, the threshold is 4
    return 4;
    return 4; // Middle cells
  }
}

// The queue of cells to explode
let explosionQueue = [];
let explosionCount = 0;

// Trigger an explosion
function triggerExplosion(row, col, player) {
  // If the game has been won, don't let the player do anything
  if (win) return;
  if (win) return; // Prevent new explosions after win

  // Add the cell to the explosion queue if it's not already in the queue
  const isDuplicate = explosionQueue.some(([r, c]) => r === row && c === col);
  if (!isDuplicate) {
    explosionQueue.push([row, col, player]);
  }

  processExplosions(player);

  // If the explosion queue has more than 5 cells, check for a win
  if (explosionQueue.length > 5) {
    if (moveCount > 1 && checkWinner() && win === false) {
      alert(`Player ${currentPlayer === 1 ? 2 : 1} wins!`);
      win = true;
      clearTimeout(explosionTimeout);
      clearTimeout(processExplosionsTimeout);
      explosionQueue = [];
      explosionCount = 0;
      if (currentPlayer === 1) {
        document.getElementById("player").style.color = "light green";
        document.getElementById("player").innerHTML = "Player: 2";
      } else {
        document.getElementById("player").style.color = "light red";
        document.getElementById("player").innerHTML = "Player: 1";
      }
      backToStart();
      return;
    }
  }
  // Set a timeout to check for a win after 1 second
  const checkWinTimeout = setTimeout(() => {
    if (moveCount > 1 && checkWinner() && isExplosionFinished() && !win) {
      win = true;
      setTimeout(() => {
        alert(`Player ${currentPlayer === 1 ? 2 : 1} wins!`);
        backToStart();
      }, 100); // Slight delay before reset
    }
  }, 1000);

  // Add the timeout ID to the timeout array
  timeoutIds.push(checkWinTimeout);
}

// Process the explosion queue
function processExplosions(curPlayer) {
  // If the game has been won or there are no more cells to explode, return
  if (win || explosionQueue.length === 0 || explosionCount >= 2) {
    explosion = false;
    return;
  }

  // Set explosion to true
  explosion = true;

  // Get the next cell to explode
  const [row, col, player] = explosionQueue.shift();
  explosionCount++;

  // Get the directions for the explosion
  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];

  // Explode the cell
  board[row][col].count = 0;
  board[row][col].player = 0;

  // Process the neighbors
  directions.forEach(([dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;

    if (
      newRow >= 0 &&
      newRow < boardSize &&
      newCol >= 0 &&
      newCol < boardSize
    ) {
      const neighbor = board[newRow][newCol];
      neighbor.player = curPlayer;
      // If the neighbor is about to explode, set a timeout to explode it
      if (neighbor.count === getExplosionThreshold(newRow, newCol)) {
        neighbor.count = getExplosionThreshold(newRow, newCol) - 1; // pwede -1 or hindi depende nalang sayo pag -1 mas mahaba laro
        const newExplosionTimeout = setTimeout(() => {
          triggerExplosion(newRow, newCol, curPlayer);
        }, 400);
        timeoutIds.push(newExplosionTimeout);
      } else {
        neighbor.count += 1;
        // If the neighbor is about to explode, set a timeout to explode it
        if (neighbor.count >= getExplosionThreshold(newRow, newCol)) {
          const newExplosionTimeout = setTimeout(() => {
            triggerExplosion(newRow, newCol, curPlayer);
          }, 400);
          timeoutIds.push(newExplosionTimeout);
        }
      }
    }
  });

  // Update the board
  updateBoard();

  // Set a timeout to process the next cell in the explosion queue
  const processTimeout = setTimeout(() => {
    explosionCount--;
    processExplosions(curPlayer);
  }, 400);

  // Add the timeout ID to the timeout array
  timeoutIds.push(processTimeout);
}

// Check if the game has been won
function checkWinner() {
  // Count the number of atoms for each player
  let player1Atoms = 0;
  let player2Atoms = 0;

  board.flat().forEach((cell) => {
    if (cell.player === 1) player1Atoms += cell.count;
    if (cell.player === 2) player2Atoms += cell.count;
  });

  return (
    (player1Atoms > 0 && player2Atoms === 0) ||
    (player2Atoms > 0 && player1Atoms === 0)
  );
}

function isExplosionFinished() {
  return explosionQueue.length === 0;
}

function playGame() {
  document.getElementById("homePage").style.display = "none";
  initBoard();
}

function backToStart() {
  document.getElementById("homePage").style.display = "flex";
  document.getElementById("aboutUs").style.display = "none";
  document.getElementById("howToPlay").style.display = "none";
  initBoard();
}

function aboutUs() {
  document.getElementById("homePage").style.display = "none";
  document.getElementById("aboutUs").style.display = "flex";
  document.getElementById("howToPlay").style.display = "none";
}

function howToPlay() {
  document.getElementById("homePage").style.display = "none";
  document.getElementById("aboutUs").style.display = "none";
  document.getElementById("howToPlay").style.display = "flex";
}
