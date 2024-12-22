const cells = document.querySelectorAll(".num");
let boardSize = 4;
let board = [];
let currentPlayer = 1;
let moveCount = 0;
let win = false;
let explosionTimeout;
let processExplosionsTimeout;

function initBoard() {
  board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => ({ player: 0, count: 0 }))
  );
  cells.forEach((cell) => {
    cell.innerHTML = "0";
    cell.player = 0;
    cell.count = 0;
    explosionQueue = [];
    explosionCount = 0;
    clearTimeout(explosionTimeout);
    clearTimeout(processExplosionsTimeout);
    updateBoard();
  });
  win = false;
  moveCount = 0; // Reset move count
  updateBoard();
}

cells.forEach((p, index) => {
  p.addEventListener("click", handleCellClick);
  let indexI = Math.floor(index / boardSize);
  let indexJ = index % boardSize;
  p.dataset.row = indexI;
  p.dataset.col = indexJ;
});

function handleCellClick(event) {
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);
  const cell = board[row][col];

  if (cell.player === 0) {
    cell.player = currentPlayer;
    cell.count++;
    moveCount++;
    updateBoard();
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  } else if (cell.player === currentPlayer) {
    cell.count++;
    moveCount++;
    console.log(board);
    if (cell.count >= getExplosionThreshold(row, col)) {
      triggerExplosion(row, col, cell.player);
    }
    updateBoard();
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  } else {
    alert("This is not your blob. \n You cannot click it.");
  }
}

function updateBoard() {
  cells.forEach((p, index) => {
    let indexI = Math.floor(index / boardSize);
    let indexJ = index % boardSize;
    p.innerHTML = board[indexI][indexJ].count;
    if (board[indexI][indexJ].player === 1) {
      p.classList.remove("player2");
      p.classList.add("player1");
    } else if (board[indexI][indexJ].player === 2) {
      p.classList.remove("player1");
      p.classList.add("player2");
    } else {
      p.classList.remove("player1");
      p.classList.remove("player2");
    }
  });
}

function getExplosionThreshold(row, col) {
  if (
    (row === 0 || row === boardSize - 1) &&
    (col === 0 || col === boardSize - 1)
  ) {
    return 2; // Corner cells
  } else if (
    row === 0 ||
    row === boardSize - 1 ||
    col === 0 ||
    col === boardSize - 1
  ) {
    return 3; // Edge cells
  } else {
    return 4; // Middle cells
  }
}

let explosionQueue = [];
let explosionCount = 0;

function triggerExplosion(row, col, player) {
  explosionQueue.push([row, col, player]);
  let curPlayer = player;
  processExplosions(curPlayer);

  if (explosionQueue.length > 5) {
    if (moveCount > 1 && checkWinner() && win === false) {
      alert(`Player ${currentPlayer} wins!`);
      win = true;
      clearTimeout(explosionTimeout);
      clearTimeout(processExplosionsTimeout);
      explosionQueue = [];
      explosionCount = 0;
      initBoard();
      return;
    }
  }

  setTimeout(() => {
    if (
      moveCount > 1 &&
      checkWinner() &&
      isExplosionFinished() &&
      win === false
    ) {
      alert(`Player ${currentPlayer} wins!`);
      win = true;
      // initializeBoard();
      return;
    }
  }, 1000);
}

function processExplosions(curPlayer) {
  if (explosionQueue.length === 0 || explosionCount >= 2 || win === true) {
    console.log("returned");
    return;
  }

  const [row, col, player] = explosionQueue.shift();
  console.log(row, col, player);
  explosionCount++;

  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];

  board[row][col].count = 0;
  board[row][col].player = 0;

  //   const cellElement = document.querySelector(
  //     `.cell[data-row="${row}"][data-col="${col}"]`
  //   );
  //   cellElement.classList.add("explode");

  //   cellElement.classList.remove("explode");

  directions.forEach(([dx, dy], index) => {
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
      if (neighbor.count === getExplosionThreshold(newRow, newCol)) {
        neighbor.count = getExplosionThreshold(newRow, newCol);
      } else {
        neighbor.count += 1;
      }
      if (neighbor.count >= getExplosionThreshold(newRow, newCol)) {
        explosionTimeout = setTimeout(() => {
          triggerExplosion(newRow, newCol, curPlayer);
        }, 400);
      }
    }
  });

  updateBoard();

  processExplosionsTimeout = setTimeout(() => {
    explosionCount--;
    processExplosions(curPlayer);
  }, 400);
}
function checkWinner() {
  let player1Atoms = 0;
  let player2Atoms = 0;

  board.flat().forEach((cell) => {
    if (cell.player === 1) player1Atoms += cell.count;
    if (cell.player === 2) player2Atoms += cell.count;
  });

  if (player1Atoms > 0 && player2Atoms === 0) {
    return true;
  }
  if (player2Atoms > 0 && player1Atoms === 0) {
    return true;
  }

  return false;
}

function isExplosionFinished() {
  if (explosionQueue.length === 0) {
    return true;
  }
  return false;
}

initBoard();
