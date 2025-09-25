const ROWS = 6;
const COLS = 7;

// Store multiple game rooms
let gameRooms = {}; // room number -> room data

function createNewRoom(roomNumber) {
  return {
    board: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
    currentPlayer: 1,
    status: "waiting",
    winner: null,
    connectedPlayers: []
  };
}

function getRoom(roomNumber) {
  if (!gameRooms[roomNumber]) {
    gameRooms[roomNumber] = createNewRoom(roomNumber);
  }
  return gameRooms[roomNumber];
}


function getBoard(req, res, q) {
  if (req.method !== 'GET') {
    res.writeHead(400);
    res.end();
    return;
  }

  const roomNumber = q.room || ""; // Default to room 1
  const room = getRoom(roomNumber);
  
  // Assign player number based on query parameter or connection order
  let playerNumber = parseInt(q.player) || 0;
  let gameFullMessage = null;
  
  if (playerNumber === 0) {
    // Auto-assign player number based on connected players in this room
    if (!room.connectedPlayers.includes(1)) {
      playerNumber = 1;
      room.connectedPlayers.push(1);
    } else if (!room.connectedPlayers.includes(2)) {
      playerNumber = 2;
      room.connectedPlayers.push(2);
    } else {
      // Game is full - too many players
      gameFullMessage = "Room is full! There are already enough players.";
      playerNumber = 0; // No valid player number
    }
  } else {
    // Player has specified a number - allow reconnection
    if (!room.connectedPlayers.includes(playerNumber) && (playerNumber === 1 || playerNumber === 2)) {
      room.connectedPlayers.push(playerNumber);
    }
    // If player number is already in the array, it's a reconnection - that's fine
  }

  const result = {
    rows: ROWS,
    cols: COLS,
    board: room.board,
    currentPlayer: room.currentPlayer,
    status: room.status,
    winner: room.winner,
    playerNumber: playerNumber,
    gameFullMessage: gameFullMessage,
    roomNumber: roomNumber
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
}

function resetBoard(req, res, q){
    if (req.method !== 'POST'){
        res.writeHead(400);
        res.end();
        return;
    }
    
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
        let requestData;
        try {
            requestData = JSON.parse(body);
        } catch {
            res.writeHead(400);
            res.end("invalid json");
            return;
        }
        
        const roomNumber = requestData.room || "";
        const room = getRoom(roomNumber);
        
        // Reset the specific room
        room.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        room.currentPlayer = 1;
        room.status = "waiting";
        room.winner = null;
        room.connectedPlayers = []; // Reset connected players

        const result = {
            rows: ROWS,
            cols: COLS,
            board: room.board,
            currentPlayer: room.currentPlayer,
            status: room.status,
            winner: room.winner,
            roomNumber: roomNumber
        }
        res.writeHead(200, {'content-Type' : 'application/json'});
        res.end(JSON.stringify(result));
    });
}


function dropDisc(req, res, q) {
  if (req.method !== 'POST') { res.writeHead(400); res.end(); return; }

  let body = "";
  req.on("data", chunk => { body += chunk; });
  req.on("end", () => {
    let play;
    try {
        play = JSON.parse(body);
    }
    catch {
        res.writeHead(400);
        res.end("invalid json");
        return; 
    }

    const col = parseInt(play.col);
    const player = parseInt(play.player);
    const roomNumber = play.room || "";
    const room = getRoom(roomNumber);

    if (room.status === 'finished') { res.writeHead(400); res.end("game finished"); return; }
    if (player !== room.currentPlayer) { res.writeHead(400); res.end("not your turn"); return; }

    // place disc bottom-up
    let rowPlaced = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (room.board[r][col] === 0) { room.board[r][col] = player; rowPlaced = r; break; }
    }
    if (rowPlaced === -1) { res.writeHead(400); res.end("column full"); return; }

    if (checkWin(rowPlaced, col, player, room.board)) {
        room.status = "finished";
        room.winner = player;
    } else {
      let boardFull = true;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (room.board[r][c] === 0) { boardFull = false; break; }
        }
        if (!boardFull) break;
      }

      if (boardFull) {
        room.status = "finished";
        room.winner = null; // tie
      } else {
        room.status = "playing";
        room.currentPlayer = (room.currentPlayer === 1) ? 2 : 1;
      }
    }

    const result = {
      rows: ROWS,
      cols: COLS,
      board: room.board,
      currentPlayer: room.currentPlayer,
      status: room.status,
      winner: room.winner,
      lastMove: { row: rowPlaced, col, by: player },
      roomNumber: roomNumber
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
  });
}


function checkWin(row, col, player, board) {
    let count, r, c;

    // horizontal 
    count = 1;
    r = row; c = col + 1;
    while (c < COLS && board[r][c] === player) {
        count++;
        c++;
    }
    c = col - 1;
    while (c >= 0 && board[r][c] === player) {
        count++;
        c--;
    }
    if (count >= 4) return true;

    // vertical 
    count = 1;
    r = row + 1; c = col;
    while (r < ROWS && board[r][c] === player) {
        count++;
        r++;
    }
    r = row - 1;
    while (r >= 0 && board[r][c] === player) {
        count++;
        r--;
    }
    if (count >= 4) return true;

    // diagonal \ 
    count = 1;
    r = row + 1; c = col + 1;
    while (r < ROWS && c < COLS && board[r][c] === player) {
        count++;
        r++;
        c++;
    }
    r = row - 1; c = col - 1;
    while (r >= 0 && c >= 0 && board[r][c] === player) {
        count++;
        r--;
        c--;
    }
    if (count >= 4) return true;

    // diagonal / 
    count = 1;
    r = row - 1; c = col + 1;
    while (r >= 0 && c < COLS && board[r][c] === player) {
        count++;
        r--;
        c++;
    }
    r = row + 1; c = col - 1;
    while (r < ROWS && c >= 0 && board[r][c] === player) {
        count++;
        r++;
        c--;
    }
    if (count >= 4) return true;

    return false;
}


exports.getBoard = getBoard;
exports.resetBoard = resetBoard;
exports.dropDisc = dropDisc;
