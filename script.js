const blobs = document.querySelectorAll(".num");
let players = 2;
let rows = 4;
let cols = 4;
let playercount = 1;
let blobIndex;
let actIndex;
let indexI;
let indexJ;
let pElement;

let array = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

blobs.forEach((p, index) => {
  p.addEventListener("click", () => {
    if (document.getElementById("playercount").value > 4) {
      players = 4;
      console.log(players);
    } else if (
      document.getElementById("playercount").value > 2 &&
      document.getElementById("playercount").value < 4
    ) {
      players = document.getElementById("playercount").value;
      console.log(players);
    } else {
      players = 2;
      console.log(players);
    }

    actIndex = index;

    pElement = p.innerHTML;

    let count = parseInt(p.innerHTML);

    blobIndex = index1dtoindex2d(index);

    let value = Number(p.getAttribute("value"));

    if (
      (playercount == players && value == 0) ||
      (playercount == players && value == playercount)
    ) {
      p.style.color = "yellow";
      p.setAttribute("value", playercount);
      p.innerHTML = count + 1;
      playercount = 1;
      arrayAdd();
    } else if (
      (playercount == 2 && value == 0) ||
      (playercount == 2 && value == playercount)
    ) {
      p.style.color = "blue";
      p.setAttribute("value", playercount);
      p.innerHTML = count + 1;
      playercount++;
      arrayAdd();
    } else if (
      (playercount == 3 && value == 0) ||
      (playercount == 3 && value == playercount)
    ) {
      p.style.color = "green";
      p.setAttribute("value", playercount);
      p.innerHTML = count + 1;
      playercount++;
      arrayAdd();
    } else if (
      (playercount == 1 && value == 0) ||
      (playercount == 1 && value == playercount)
    ) {
      p.style.color = "red";
      p.setAttribute("value", playercount);
      p.innerHTML = count + 1;
      playercount++;
      arrayAdd();
    }
    console.log("playercount:", playercount);
    console.log("value:", value);
    console.log(array[indexI][indexJ]);
  });
});

function index1dtoindex2d(num) {
  let row = Math.floor(num / cols);
  let col = num % cols;
  return String(row) + String(col);
}

function explode() {
  if (array[indexI][indexJ] == 4) {
    alert("explode");
    array[indexI][indexJ] = 0;
    document.getElementsByTagName("p")[actIndex].innerHTML = 0;
    document.getElementsByTagName("p")[actIndex].style.color = "black";
  }
}
function arrayAdd() {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      let arrayvalue = String(i) + String(j);
      if (blobIndex == arrayvalue) {
        indexI = i;
        indexJ = j;
        array[i][j]++;
        break;
      }
    }
  }
  explode();
}
