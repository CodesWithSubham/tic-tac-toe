const boardSvg = document.getElementById("boardSvg");
const statusEl = document.getElementById("status");
const historyList = document.getElementById("historyList");

const BOT_KEY = "TTT_BOT_HISTORY";
const PVP_KEY = "TTT_PVP_HISTORY";

let board, currentPlayer, gameOver, mode;

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const cellSize = 100;
const NS = "http://www.w3.org/2000/svg";

function startGame(m) {
  mode = m;
  board = Array(9).fill("");
  gameOver = false;
  currentPlayer = Math.random() > 0.5 ? "X" : "O";

  boardSvg.innerHTML = "";
  document.querySelector(".board-wrapper").classList.remove("hidden");
  document.getElementById("modeSelect").classList.add("hidden");
  document.getElementById("restart").classList.remove("hidden");

  drawGrid();
  drawCells();

  updateTurn();
  loadHistory();

  if (mode === "bot" && currentPlayer === "O") {
    setTimeout(botMove, 400);
  }
}

function drawGrid() {
  for (let i = 1; i <= 2; i++) {
    const v = document.createElementNS(NS, "line");
    v.setAttribute("x1", i * cellSize);
    v.setAttribute("y1", 0);
    v.setAttribute("x2", i * cellSize);
    v.setAttribute("y2", 300);
    v.classList.add("grid-line");

    const h = document.createElementNS(NS, "line");
    h.setAttribute("x1", 0);
    h.setAttribute("y1", i * cellSize);
    h.setAttribute("x2", 300);
    h.setAttribute("y2", i * cellSize);
    h.classList.add("grid-line");

    boardSvg.append(v, h);
  }
}

function drawCells() {
  for (let i = 0; i < 9; i++) {
    const x = (i % 3) * cellSize;
    const y = Math.floor(i / 3) * cellSize;

    const rect = document.createElementNS(NS, "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", cellSize);
    rect.setAttribute("height", cellSize);
    rect.setAttribute("class", "cell");
    rect.addEventListener("click", () => move(i));

    boardSvg.appendChild(rect);
  }
}

function updateTurn() {
  statusEl.textContent = `Turn: ${currentPlayer}`;
  document.body.className = currentPlayer === "X" ? "turn-x" : "turn-o";
}

function move(i) {
  if (board[i] || gameOver) return;
  board[i] = currentPlayer;

  const cx = (i % 3) * cellSize + 50;
  const cy = Math.floor(i / 3) * cellSize + 50;

  if (currentPlayer === "X") drawX(cx, cy);
  else drawO(cx, cy);

  if (checkWin()) return;

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurn();

  if (mode === "bot" && currentPlayer === "O") {
    setTimeout(botMove, 400);
  }
}

function drawX(cx, cy) {
  const l1 = document.createElementNS(NS, "line");
  const l2 = document.createElementNS(NS, "line");

  [l1, l2].forEach(l => {
    l.setAttribute("x1", cx - 25);
    l.setAttribute("y1", cy - 25);
    l.setAttribute("x2", cx + 25);
    l.setAttribute("y2", cy + 25);
    l.classList.add("x-line");
  });

  l2.setAttribute("y1", cy + 25);
  l2.setAttribute("y2", cy - 25);

  boardSvg.append(l1, l2);
}

function drawO(cx, cy) {
  const c = document.createElementNS(NS, "circle");
  c.setAttribute("cx", cx);
  c.setAttribute("cy", cy);
  c.setAttribute("r", 28);
  c.classList.add("o-circle");
  boardSvg.appendChild(c);
}

function botMove() {
  const empty = board.map((v,i)=>v===""?i:null).filter(v=>v!==null);
  move(empty[Math.floor(Math.random()*empty.length)]);
}

function checkWin() {
  for (const [a,b,c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      drawWinLine(a, c);
      endGame(`${board[a]} Wins`);
      return true;
    }
  }
  if (!board.includes("")) {
    endGame("Draw");
    return true;
  }
  return false;
}

function drawWinLine(a, c) {
  const pos = i => [
    (i % 3) * cellSize + 50,
    Math.floor(i / 3) * cellSize + 50
  ];

  const [x1,y1] = pos(a);
  const [x2,y2] = pos(c);

  const line = document.createElementNS(NS, "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.classList.add("win-line");

  boardSvg.appendChild(line);
}

function endGame(text) {
  gameOver = true;
  statusEl.textContent = text;
  saveHistory(text);
}

function restart() {
  location.reload();
}

function saveHistory(result) {
  const key = mode === "bot" ? BOT_KEY : PVP_KEY;
  const data = JSON.parse(localStorage.getItem(key)) || [];
  data.unshift(`${result} • ${new Date().toLocaleTimeString()}`);
  localStorage.setItem(key, JSON.stringify(data.slice(0,20)));
  loadHistory();
}

function loadHistory() {
  const key = mode === "bot" ? BOT_KEY : PVP_KEY;
  const data = JSON.parse(localStorage.getItem(key)) || [];
  historyList.innerHTML = "";
  data.forEach(t=>{
    const li = document.createElement("li");
    li.textContent = t;
    historyList.appendChild(li);
  });
}
