# 🎮 4-in-Row Multiplayer Game

A real-time multiplayer Connect Four game built with Node.js and vanilla JavaScript. Players can create rooms and play against each other across different devices on the same network.

## 🚀 Features

- **Multi-room Support**: Create and join different game rooms
- **Real-time Gameplay**: Automatic synchronization between players
- **Cross-device Play**: Play from different computers on the same network
- **Turn-based System**: Enforced player turns with visual feedback
- **Session Persistence**: Players maintain their identity after page refresh
- **Room Management**: Reset games and switch between rooms

## 📁 Project Structure

```
4InRow/
├── server/
│   ├── main.js          # Express server setup
│   ├── api.js           # Game logic and API endpoints
│   └── package.json     # Server dependencies
├── client/
│   └── game/
│       ├── src/
│       │   ├── main.js      # Client-side game logic
│       │   └── style.css    # Game styling
│       ├── index.html       # Game interface
│       └── package.json     # Client dependencies
└── README.md
```

## 🛠️ Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup Steps

1. **Clone or download the project**
   ```bash
   cd 4InRow
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client/game
   npm install
   ```

## 🎯 Running the Game

### For Local Play (Same Computer)

1. **Start the server** (in one terminal):
   ```bash
   cd server
   node main.js
   ```
   You should see: `now server is listening on port 3000 on all interfaces...`

2. **Start the client** (in another terminal):
   ```bash
   cd client/game
   npm run dev
   ```
   You should see: `Local: http://localhost:5173/`

3. **Open the game**:
   - Open your browser and go to `http://localhost:5173`
   - Open another browser window/tab for the second player


## 🎮 How to Play

### Starting a Game

1. **Enter Room Number**: Type a room number (e.g., 1, 2, 3)
2. **Click "Join Room"**: Connect to the specified room
3. **Player Assignment**: 
   - First player in room → Player 1 (Red pieces)
   - Second player in room → Player 2 (Yellow pieces)
4. **Game Starts**: Players take turns dropping pieces

### Game Rules

- **Objective**: Get 4 pieces in a row (horizontal, vertical, or diagonal)
- **Turn System**: Only the current player can make moves
- **Winning**: Game announces winner and stops accepting moves
- **Room Limits**: Maximum 2 players per room

### Controls

- **Click Column**: Drop your piece in that column
- **Reset Game**: Clear the current room's board
- **Join Room**: Switch to a different room


## 📝 License

This project is for educational purposes. Feel free to modify and distribute.

---

**Enjoy playing 4-in-Row! 🎉**
