// kunin lahat ng images
const cells = document.querySelectorAll(".num");

// kun gaano kalaki yung board 6x6
let boardSize = 6;

let board = [];
let currentPlayer = 1;
let moveCount = 0;
let win = false;

// mga timeout id
let explosionTimeout;
let processExplosionsTimeout;

let timeoutIds = [];

let explosion = false;

// gawin yung board
function initBoard() {
  // clear lahat ng mga timeout para wala ng pagsabog na mangyari
  timeoutIds.forEach((id) => clearTimeout(id));
  timeoutIds = [];

  // gagawin yung array ng board katamad kasi imano-mano 36 cells kasi kaya ganto nalang
  board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => ({ player: 0, count: 0 }))
  );

  // reset yung mga values ng bawat cell dun sa 2d array
  cells.forEach((cell) => {
    cell.player = 0;
    cell.count = 0;
  });

  // reset lahat ng variable na nagbago
  explosionQueue = [];
  explosionCount = 0;
  win = false;
  moveCount = 0;
  currentPlayer = 1;
  updateBoard();
}

// para malagyan bawat cell ng onclick tapos mahanap yung row and col nila
cells.forEach((p, index) => {
  p.addEventListener("click", handleCellClick);
  let indexI = Math.floor(index / boardSize);
  let indexJ = index % boardSize;
  p.dataset.row = indexI;
  p.dataset.col = indexJ;
});

function handleCellClick(event) {
  // pag may sumasabog pa na cell alert tapos wala dapat mangyayari
  if (explosion) {
    alert("Explosion in progress!");
    return;
  }
  // pag may nanalo din dapat bawal na magclick
  if (win) return;

  // para makuha yung row at col ng cell na nag click
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);
  const cell = board[row][col];

  if (cell.player === 0) {
    cell.player = currentPlayer;
    cell.count++;
    moveCount++;
    updateBoard();
    // Switch player
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
    cell.count++;
    moveCount++;
    // page parehas na young value ng cell at yung kailangan para sumabog sasabog na sya
    if (cell.count >= getExplosionThreshold(row, col)) {
      triggerExplosion(row, col, cell.player);
    }
    updateBoard();
    // Switch player
    if (currentPlayer === 1) {
      currentPlayer = 2;
      document.getElementById("player").style.color = "green";
      document.getElementById("player").innerHTML = "Player: " + currentPlayer;
    } else {
      currentPlayer = 1;
      document.getElementById("player").style.color = "red";
      document.getElementById("player").innerHTML = "Player: " + currentPlayer;
    }
  } else {
    //  pag di sayo yung cell tapos kinlick mo dapat walang mangyayari
    alert("This is not your blob. \nYou cannot click it.");
  }
}

// update yung board ng mga images
function updateBoard() {
  // pag wala pang moves na nangyari set to player 1 muna
  if (moveCount < 1) {
    document.getElementById("player").style.color = "red";
    document.getElementById("player").innerHTML = "Player: 1";
  }

  // update lahat ng img element
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

// para makuha kung ilan clicks para sumabog isang cell
function getExplosionThreshold(row, col) {
  // pag nasa corner 2 clicks
  if (
    (row === 0 || row === boardSize - 1) &&
    (col === 0 || col === boardSize - 1)
  ) {
    return 2;
  } else if (
    // pag nasa edge 3 clicks
    row === 0 ||
    row === boardSize - 1 ||
    col === 0 ||
    col === boardSize - 1
  ) {
    return 3;
  } else {
    // pag nasa gitna 4 clicks
    return 4;
  }
}

// que ng cells na kailangan pasabugin
let explosionQueue = [];
let explosionCount = 0;

// pang trigger ng pagsabog
function triggerExplosion(row, col, player) {
  // pag nanalo na dapat wala ng pagsabog
  if (win) return;

  // mag-aadd lang ng cell sa explosion queue pag wala pa sya don previously
  let isDuplicate = false;

  for (let i = 0; i < explosionQueue.length; i++) {
    const [r, c, player] = explosionQueue[i];
    if (r === row && c === col) {
      isDuplicate = true;
      break;
    }
  }

  if (!isDuplicate) {
    explosionQueue.push([row, col, player]);
  }

  processExplosions(player);

  // pag 5 cells na yung nasa queue mag check kung may nanalo na para hindi matagal
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
  // may delay na 1 second bago magcheck ng winner
  const checkWinTimeout = setTimeout(() => {
    if (moveCount > 1 && checkWinner() && isExplosionFinished() && !win) {
      win = true;
      setTimeout(() => {
        alert(`Player ${currentPlayer === 1 ? 2 : 1} wins!`);
        backToStart();
      }, 100);
    }
  }, 1000);

  // i-add yung timeout sa array ng mga timeout
  timeoutIds.push(checkWinTimeout);
}

function processExplosions(curPlayer) {
  // pag may nanalo na / wala ng cells na papasabugin / 2 cells na yung sumasabog return muna
  if (win || explosionQueue.length === 0 || explosionCount >= 2) {
    explosion = false;
    return;
  }

  explosion = true;

  // kunin yung cell na dapat pasabugin
  const [row, col, player] = explosionQueue.shift();
  explosionCount++;

  // mga direction na maapektohan ng pagsabog
  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];

  // gawing 0 values ng cell kasi nga sumabog na
  board[row][col].count = 0;
  board[row][col].player = 0;

  // kunin yung neighbor ng cell
  directions.forEach(([dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;

    // check kung nasa board ba talaga yung neighbor cell
    if (
      newRow >= 0 &&
      newRow < boardSize &&
      newCol >= 0 &&
      newCol < boardSize
    ) {
      const neighbor = board[newRow][newCol];
      neighbor.player = curPlayer;
      // kung parehas na yung count ng neighbor cell at threshold pasabugin with a delay para din hindi sumobra amount ng atoms sa isang cell
      if (neighbor.count === getExplosionThreshold(newRow, newCol)) {
        neighbor.count = getExplosionThreshold(newRow, newCol) - 1; // pwede -1 or hindi depende nalang sayo pag -1 mas mahaba laro ata di ko sure sa difference
        const newExplosionTimeout = setTimeout(() => {
          triggerExplosion(newRow, newCol, curPlayer);
        }, 400);
        timeoutIds.push(newExplosionTimeout);
      } else {
        // dagdagan muna bago icheck kung nasa explosion threshold na yung neighbor cell
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

  // Update yung board
  updateBoard();

  // delay bago iprocess yung sunod na cell
  const processTimeout = setTimeout(() => {
    explosionCount--;
    processExplosions(curPlayer);
  }, 400);

  timeoutIds.push(processTimeout);
}

// Check kung may nanalo na
function checkWinner() {
  // pang count kung ilan atoms
  let player1Atoms = 0;
  let player2Atoms = 0;

  board.flat().forEach((cell) => {
    if (cell.player === 1) {
      player1Atoms += cell.count;
    }
    if (cell.player === 2) {
      player2Atoms += cell.count;
    }
  });

  // pag yung isa walang cells tas yung isa meron ibig sabihin may nanalo so return true
  if (
    (player1Atoms > 0 && player2Atoms === 0) ||
    (player2Atoms > 0 && player1Atoms === 0)
  ) {
    return true;
  }
}

// function para macheck kung tapos na yung pagsabog
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
