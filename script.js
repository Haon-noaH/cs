const cells = document.querySelectorAll(".num");
let boardSize = 4;
let board = [];
let currentPlayer = 1;
let moveCount = 0;
let win = false;
let explosionTimeout;
let processExplosionsTimeout;
let timeoutIds = []; // Array to store all timeout IDs
let explosion = false;

function initBoard() {
  // Clear all pending timeouts
  timeoutIds.forEach((id) => clearTimeout(id));
  timeoutIds = [];

  board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => ({ player: 0, count: 0 }))
  );

  cells.forEach((cell) => {
    cell.innerHTML = "0";
    cell.player = 0;
    cell.count = 0;
  });

  explosionQueue = [];
  explosionCount = 0;
  win = false;
  moveCount = 0;
  currentPlayer = 1;
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
  if (explosion) {
    alert("Explosion in progress!");
    return;
  }
  if (win) return; // Prevent moves after win condition

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
    if (cell.count >= getExplosionThreshold(row, col)) {
      triggerExplosion(row, col, cell.player);
    }
    updateBoard();
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  } else {
    alert("This is not your blob. \nYou cannot click it.");
  }
}

function updateBoard() {
  if (moveCount < 1) {
    document.getElementById("player").style.color = "red";
  } else if (currentPlayer === 1) {
    document.getElementById("player").style.color = "blue";
    document.getElementById("player").innerHTML = "2";
  } else {
    document.getElementById("player").style.color = "red";
    document.getElementById("player").innerHTML = "1";
  }
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
  if (win) return; // Prevent new explosions after win

  explosionQueue.push([row, col, player]);
  processExplosions(player);

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
  const checkWinTimeout = setTimeout(() => {
    if (moveCount > 1 && checkWinner() && isExplosionFinished() && !win) {
      win = true;
      setTimeout(() => {
        alert(`Player ${currentPlayer} wins!`);
        initBoard();
      }, 100); // Slight delay before reset
    }
  }, 1000);

  timeoutIds.push(checkWinTimeout);
}

function processExplosions(curPlayer) {
  if (win || explosionQueue.length === 0 || explosionCount >= 2) {
    explosion = false;
    return;
  }

  explosion = true;

  const [row, col, player] = explosionQueue.shift();
  explosionCount++;

  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];

  board[row][col].count = 0;
  board[row][col].player = 0;

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
      if (neighbor.count === getExplosionThreshold(newRow, newCol)) {
        neighbor.count = getExplosionThreshold(newRow, newCol) - 1; // pwede -1 or hindi depende nalang sayo pag -1 mas mahaba laro
        const newExplosionTimeout = setTimeout(() => {
          triggerExplosion(newRow, newCol, curPlayer);
        }, 400);
        timeoutIds.push(newExplosionTimeout);
      } else {
        neighbor.count += 1;
        if (neighbor.count >= getExplosionThreshold(newRow, newCol)) {
          const newExplosionTimeout = setTimeout(() => {
            triggerExplosion(newRow, newCol, curPlayer);
          }, 400);
          timeoutIds.push(newExplosionTimeout);
        }
      }
    }
  });

  updateBoard();

  const processTimeout = setTimeout(() => {
    explosionCount--;
    processExplosions(curPlayer);
  }, 400);

  timeoutIds.push(processTimeout);
}

function checkWinner() {
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

initBoard();
