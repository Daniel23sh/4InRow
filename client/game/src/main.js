const ROWS =6;
const COLS =7;
let board;
let currentPlayer = 1;
let gameOver = false;
let myPlayerNumber = 0; // This window's player number
let currentRoom = "1"; // Current room number

function sendHttpGetRequest(url, callback) {
  let request = new XMLHttpRequest();
  request.onreadystatechange = () => {
    if (request.readyState === 4 && request.status === 200) {
      callback(request.responseText);
    }
  };
  request.open("GET", url, true);
  request.send();
}

function sendHttpPostRequest(url, callback, body) {
  let request = new XMLHttpRequest();
  request.onreadystatechange = () => {
    if (request.readyState === 4 && request.status === 200) {
      callback(request.responseText);
    }
  };
  request.open("POST", url, true);
  request.setRequestHeader("Content-Type", "application/json"); // important!
  request.send(body);
}

function init(){
    board = document.getElementById("board");
    const savedPlayerNumber = sessionStorage.getItem('playerNumber');
    const savedRoom = sessionStorage.getItem('currentRoom');
    if (savedPlayerNumber) {
        myPlayerNumber = parseInt(savedPlayerNumber);
    }
    if (savedRoom) {
        currentRoom = savedRoom;
        document.getElementById('room-input').value = currentRoom;
        loadBoard();
    } else {
        currentRoom = ""; 
        updatePlayerDisplay();
    }
    
    // Simple interval that runs for all windows
    setInterval(() => {
        if (!gameOver && currentRoom) {
            loadBoard();
        }
    }, 1000);
};

async function loadBoard() {
    if (!currentRoom) {
        return;
    }
    
    const playerParam = myPlayerNumber > 0 ? `&player=${myPlayerNumber}` : "";
    const url = `http://localhost:3000/api/board?room=${currentRoom}${playerParam}`;
    sendHttpGetRequest(url, (res) =>{
      const data = JSON.parse(res)
      
      // Check if game is full
      if (data.gameFullMessage && myPlayerNumber === 0) {
          alert(data.gameFullMessage);
          return;
      }
      
      createBoard(data.rows, data.cols);
      colorBoard(data.board);
      window.currentPlayer = data.currentPlayer;
      
      // Only set player number if not already set
      if (myPlayerNumber === 0) {
          myPlayerNumber = data.playerNumber;
          // Save to sessionStorage for refresh persistence
          if (myPlayerNumber > 0) {
              sessionStorage.setItem('playerNumber', myPlayerNumber.toString());
          }
      }
      
      // Check for game over and show win message to both players
      if (data.status === "finished" && !gameOver) {
          gameOver = true;
          setTimeout(() => {
              if (data.winner) {
                  const winnerText = data.winner === myPlayerNumber ? "You win!" : `Player ${data.winner} wins!`;
                  alert(winnerText);
              } else {
                  alert("Tie!");
              }
          }, 100); // Small delay to ensure UI updates first
      }
      
      updatePlayerDisplay();
    });
}

function createBoard(rows = ROWS, cols = COLS){
  board.innerHTML = '';
  for (let r =0; r< rows; r++){
    const row = document.createElement("tr");
    for(let c=0; c< cols; c++){
      const td = document.createElement("td");
      const cell = document.createElement("div");
      cell.id = `cell-${r}-${c}`;
      cell.classList.add("cell");
      cell.addEventListener("click", () => handleCellClick(r,c));
      td.appendChild(cell);
      row.appendChild(td);
    }
    board.appendChild(row);
  }
};

function colorBoard(serverBoard) {
  for (let r = 0; r < serverBoard.length; r++) {
    for (let c = 0; c < serverBoard[0].length; c++) {
      const cell = document.getElementById(`cell-${r}-${c}`);
      if (!cell) continue;
      cell.classList.remove("player1", "player2");
      if (serverBoard[r][c] === 1) cell.classList.add("player1");
      if (serverBoard[r][c] === 2) cell.classList.add("player2");
    }
  }
}

function updatePlayerDisplay() {
  const app = document.getElementById("app");
  let playerDisplay = document.getElementById("playerInfo");
  
  if (!playerDisplay) {
    playerDisplay = document.createElement("div");
    playerDisplay.id = "playerInfo";
    playerDisplay.style.marginBottom = "20px";
    playerDisplay.style.fontSize = "18px";
    playerDisplay.style.fontWeight = "bold";
    app.insertBefore(playerDisplay, document.getElementById("board"));
  }
  
  // Handle case when no room is selected yet
  if (!currentRoom) {
    playerDisplay.innerHTML = "Please enter a room number and click 'Join Room' to start playing!";
    playerDisplay.style.color = "blue";
    return;
  }
  
  // Handle case when player number is 0 (game full)
  if (myPlayerNumber === 0) {
    playerDisplay.innerHTML = "Room is full! Try a different room number.";
    playerDisplay.style.color = "red";
    return;
  }
  
  const playerColor = myPlayerNumber === 1 ? "red" : "yellow";
  const canPlay = window.currentPlayer === myPlayerNumber;
  const turnText = canPlay ? "Your turn!" : "Waiting for other player...";
  
  playerDisplay.innerHTML = `
    Room ${currentRoom} - You are Player ${myPlayerNumber} (${playerColor})<br>
    ${turnText}
  `;
  playerDisplay.style.color = canPlay ? "green" : "gray";
}

function handleCellClick(r,c){
  if (gameOver) return;
  
  // Check if player has a valid number (not 0 = game full)
  if (myPlayerNumber === 0) {
    alert("Game is full! You cannot play.");
    return;
  }
  
  // Check if it's this player's turn
  if (window.currentPlayer !== myPlayerNumber) {
    alert("It's not your turn!");
    return;
  }
  
  const body = JSON.stringify({col: c, player: myPlayerNumber, room: currentRoom});
  sendHttpPostRequest("http://localhost:3000/api/move", (res) => {
    const data = JSON.parse(res);
    colorBoard(data.board);
    window.currentPlayer = data.currentPlayer;
    updatePlayerDisplay(); // Update display after move

    if (data.status === "finished"){
      gameOver = true;
      if (data.winner) {
        const winnerText = data.winner === myPlayerNumber ? "You win!" : `Player ${data.winner} wins!`;
        alert(winnerText);
      }
      else{
        alert("Tie!")
      }
    }
  }, body)
};

// Function to join a specific room
function joinRoom() {
    const roomInput = document.getElementById('room-input');
    const newRoom = roomInput.value || "1";
    
    if (!newRoom.trim()) {
        alert("Please enter a room number!");
        return;
    }
    
    sessionStorage.removeItem('playerNumber');
    myPlayerNumber = 0;
    currentRoom = newRoom;
    gameOver = false;
    
    sessionStorage.setItem('currentRoom', currentRoom);
    
    loadBoard();
}

// Function to reset game and clear player identity
function resetGame() {
    sessionStorage.removeItem('playerNumber');
    myPlayerNumber = 0;
    gameOver = false;
    // Call server reset endpoint
    const body = JSON.stringify({room: currentRoom});
    sendHttpPostRequest("http://localhost:3000/api/reset", (res) => {
        loadBoard();
    }, body);
}

window.init = init;
window.createBoard = createBoard;
window.resetGame = resetGame;
window.joinRoom = joinRoom;