// Establish connection to the server using Socket.IO
const socket = io.connect();

// Get the room ID from the HTML data attribute
const roomId = document.getElementById('room-info').dataset.roomId;

const boardElement = document.getElementById('board');
const PLAYER_X_CLASS = 'x'; // Matches your CSS class for 'X'
const PLAYER_O_CLASS = 'circle';
const Errorsfx = new Audio('/static/sounds/invalid.wav');
Errorsfx.volume = 0.7;

// Join the room
socket.emit('join_room', { room_id: roomId });

// Listen for board updates from the server
socket.on('board_update', (data) => {
    console.log("Board update received:", data);  // Debug log to track incoming board updates
    updateBoard(data.board, data.current_turn);   // Update board UI with latest data
    setBoardHoverClass(data.current_turn);
});

// Listen for game over events
socket.on('game_over', (data) => {
    console.log("Game over event received:", data);  // Debug log for game over events
    const winningText = document.getElementById('winning-text');
    if (data.winner) {
        winningText.textContent = `Winner: ${data.winner}`;
    } else {
        winningText.textContent = "It's a tie!";
    }
    document.querySelector('.winning-message').classList.add('show');


});



// Listen for invalid move events
socket.on('invalid_move', (data) => {
    console.log("Invalid move:", data.message);  // Log invalid move message
    Errorsfx.currentTime = 0;  // reset sfx
    Errorsfx.play() // play sfx
});

// Function to update the board UI based on the server's board data
function updateBoard(board, currentTurn) {
    console.log("Updating board with:", board, "Current turn:", currentTurn); // Debugging line
    board.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
            const cell = document.querySelector(`.cell[data-row="${rowIndex}"][data-col="${colIndex}"]`);
            if (cell) {
                cell.classList.remove(PLAYER_X_CLASS, PLAYER_O_CLASS);
                if (cellValue === 'X') {
                    cell.classList.add(PLAYER_X_CLASS);
                } else if (cellValue === 'O') {
                    cell.classList.add(PLAYER_O_CLASS);
                }
            }
        });
    });
    setBoardHoverClass(currentTurn);
    // Update the turn display
    document.getElementById('turn').textContent = `Current turn: ${currentTurn}`;
}

// Handle cell clicks and send move to the server
document.querySelectorAll('.cell').forEach((cell, index) => {
    // Set row and column data attributes for each cell
    const row = Math.floor(index / 3);
    const col = index % 3;
    cell.setAttribute("data-row", row);
    cell.setAttribute("data-col", col);

    cell.addEventListener('click', () => {
        console.log(`Move made at row ${row}, column ${col}`);  // Debug log for move
        socket.emit('move', { room_id: roomId, V: row, H: col });
    });
});

// Restart the game when the restart button is clicked
document.getElementById('restart-button').addEventListener('click', () => {
    console.log("Restart game clicked");  // Debug log for restart
    socket.emit('restart_game', { room_id: roomId });  // Emit a restart request to the server
    document.querySelector('.winning-message').classList.remove('show');  // Hide the winning message
});

socket.on('restart_game', (data) => {
    window.location.href = data.url;  // Redirect to the tictacrooms page
});

function setBoardHoverClass(currentTurn) {
    const board = document.querySelector('.board');

    // Clear existing hover classes
    board.classList.remove(PLAYER_X_CLASS, PLAYER_O_CLASS);

    // Add hover effect only for the current player's turn
    if (currentTurn === 'X') {
        board.classList.add(PLAYER_X_CLASS); // Enable hover for 'X'
    } else if (currentTurn === 'O') {
        board.classList.add(PLAYER_O_CLASS); // Enable hover for 'O'
    }
}