const pieceImages = {
    'r': 'b_rook', 'n': 'b_knight', 'b': 'b_bishop', 'q': 'b_queen', 'k': 'b_king', 'p': 'b_pawn',
    'R': 'w_rook', 'N': 'w_knight', 'B': 'w_bishop', 'Q': 'w_queen', 'K': 'w_king', 'P': 'w_pawn'
};

const movesound = new Audio('/static/sounds/move.wav');
const checksound = new Audio('/static/sounds/check.wav');
const matesound = new Audio('/static/sounds/checkmate.wav');
const capturesound = new Audio('/static/sounds/capture.wav');
const errorsound = new Audio('/static/sounds/invalid.wav');
errorsound.volume = 0.7;

const boardElement = document.getElementById('chessboard');
let asd;
let disconnectCountdown;
let countdownTime = 60;  // 1 minute
let selectedSquare = null;
let selectedPiece = null;
let selectedSquareData = null;
let boardState = {}; // keep track of pos
let draggedPiece = null;
let sourceSquare = null;
let dragGhost = null;
let isDragging = false;
let actualFEN = null;
const socket = io.connect();
socket.emit('join', {room: roomid});


function mirrorFEN(fen) {
    const ranks = fen.split(' ')[0].split('/');
    // Reverse the order of the ranks
    const mirroredRanks = ranks.reverse().map(rank => {
        // Reverse the pieces within each rank
        return rank.split('').reverse().join('');
    });
    return mirroredRanks.join('/');
}


socket.on('connect', () => {
    // Emit a custom event to the server indicating that the player has reconnected
    socket.emit('player_reconnected', { roomid: roomid });
});

// Render the board based on the FEN string
function renderBoard(fen) {
    boardElement.innerHTML = '';
    boardState = {};

    // Split the FEN string into ranks
    
    actualFEN = (currentPlayer === 'black') ? mirrorFEN(fen) : fen;

    const ranks = actualFEN.split(' ')[0].split('/');

    // Loop through each rank
    for (let row = 0; row < 8; row++) {
        let actualRow = (currentPlayer === 'black') ? 7 - row : row

        let col = 0; // Reset column index for each row
        const rank = ranks[row];

        // Loop through each character in the rank
        for (let i = 0; i < rank.length; i++) {
            const piece = rank[i];
            const square = document.createElement('div');
            square.classList.add('square');

            // Determine square color
            if ((row + col) % 2 === 0) {
                square.classList.add('white');
            } else {
                square.classList.add('black');
            }



            let actualCol = (currentPlayer === 'black') ? 7 - col : col;

            if (actualRow === ((currentPlayer === 'black') ?  0 : 7)) {
                const collabel = document.createElement('div');
                collabel.textContent = String.fromCharCode(97 + actualCol);
                collabel.classList.add('row-label')

                if (col % 2 == 0) {
                    collabel.classList.add('label-white');
                }

                else {
                    collabel.classList.add('label-black');
                }

                square.appendChild(collabel);
            }

            if (col === 0) {
                const rowlabel = document.createElement('div');
                rowlabel.textContent = 8 - actualRow;
                rowlabel.classList.add('col-label');

                if (row % 2 == 0) {
                    rowlabel.classList.add('label-black');
                }

                else {
                    rowlabel.classList.add('label-white');
                }

                square.appendChild(rowlabel);
            }

            if (isNaN(piece)) {
                // If the character is not a number, it's a piece
                const img = document.createElement('img');
                img.src = `/static/images/chess/${pieceImages[piece]}.png`;
                img.alt = piece;
                img.draggable = true;
                img.addEventListener("dragstart", handleDragStart)
                img.classList.add('piece-img');

                square.appendChild(img);
                col++; // Increment for pieces
            } else {
                // If the character is a number, it indicates empty squares
                const emptySquares = parseInt(piece);
                for (let j = 0; j < emptySquares; j++) {
                    // Create empty squares based on the number
                    const emptySquare = document.createElement('div');
                    emptySquare.classList.add("square")
                    if ((row % 2 === 0 && col % 2 === 0) || (row % 2 === 1 && col % 2 === 1)) {
                        emptySquare.classList.add("white")
                    }
                    else {
                        emptySquare.classList.add("black")
                    }
                    
                    if (actualRow === ((currentPlayer === 'black') ? 0 : 7)) {
                        const collabel = document.createElement('div');
                        collabel.textContent = String.fromCharCode(97 + actualCol);
                        collabel.classList.add('row-label');
                        
                        if (col % 2 == 0) {
                            collabel.classList.add('label-white');
                        }
                        else {
                            collabel.classList.add('label-black');
                        }
                        emptySquare.appendChild(collabel);
                    }
        
                    if (col === 0) {
                        const rowlabel = document.createElement('div');
                        rowlabel.textContent = 8 - actualRow;
                        rowlabel.classList.add('col-label');

                        if (row % 2 == 0) {
                            rowlabel.classList.add('label-black');
                        }
                        else {
                            rowlabel.classList.add('label-white');
                        }
                        emptySquare.appendChild(rowlabel);
                    }

                    emptySquare.addEventListener('click', () => handleSquareClick(emptySquare));
                    boardElement.appendChild(emptySquare); // Add empty square
                    col++; // Increment column for each empty square
                    const squareCol = (currentPlayer === 'black') ? 7 - (col - 1) : col - 1;
                    emptySquare.dataset.square = String.fromCharCode(97 + squareCol) + (8 - actualRow); // e.g., 'e2'
                }
                continue; // Skip to the next character
            }
            
            const squareCol = (currentPlayer === 'black') ? 7 - (col - 1) : col - 1;
            square.dataset.square = String.fromCharCode(97 + squareCol) + (8 - actualRow); // e.g., 'e2'
            square.addEventListener('click', () => handleSquareClick(square));

            boardElement.appendChild(square);
            if (isNaN(piece)) {
                boardState[square.dataset.square] = piece;
            }

        }
    }
}

// Handle square click for moving pieces
function handleSquareClick(square) {
    const squareData = square.dataset.square
    const piece = square.dataset.piece;
    const img = square.querySelector('img')

    
    if (selectedSquare) {
        selectedSquare.classList.remove('selected')
        const move = selectedSquare.dataset.square + squareData;
        submitMove(move, selectedSquare, null);
        selectedSquare = null;
        selectedPiece = null;
    } else {
        if (img) {
            const piecese = img.alt;

            if ((currentPlayer === "white" && piecese.toUpperCase() !== piecese) || (currentPlayer === "black" && piecese.toLowerCase() !== piecese)) {
                errorsound.play();
                return;
            }

            selectedSquare = square;
            selectedPiece = piece;
            square.classList.add('selected')
        }
    }
    isDragging = false;
}

function handleDragStart(event) {
    const squares = document.querySelectorAll('.selected')
    const piecese = event.target.alt;

    if ((currentPlayer === "white" && piecese.toUpperCase() !== piecese) || (currentPlayer === "black" && piecese.toLowerCase() !== piecese)) {
        errorsound.play();
        return;
    }


    squares.forEach(square => {
        square.classList.remove('selected')
    });

    isDragging = true;
    draggedPiece = event.target;
    sourceSquare = event.target.parentElement.dataset.square;
    event.preventDefault();

    // Create ghost
    dragGhost = document.createElement('img');
    dragGhost.src = draggedPiece.src;
    dragGhost.classList.add('drag-ghost');
    dragGhost.style.transform = 'scale(0.52)'; 
    dragGhost.style.position = 'absolute'; 
    dragGhost.style.pointerEvents = 'none'; 
    dragGhost.style.zIndex = '9999';

    document.body.appendChild(dragGhost);


    setTimeout(() => {
        // Remove the original piece image after the ghost is created
        draggedPiece.style.visibility = 'hidden';  
    }, 1)


    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(event) {
    if (dragGhost) {
        // center
        const offsetX = dragGhost.width / 2;
        const offsetY = dragGhost.height / 2;

        dragGhost.style.left = (event.pageX - offsetX) + 'px';
        dragGhost.style.top = (event.pageY - offsetY) + 'px';
    }
}

function handleMouseUp(event) {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    let targetSquare = document.elementFromPoint(event.clientX, event.clientY).dataset.square;
    if (targetSquare == null) {
        targetSquare = document.elementFromPoint(event.clientX, event.clientY).parentElement.dataset.square;
    }

    if (draggedPiece && sourceSquare && targetSquare) {
        const move = sourceSquare + targetSquare;
        submitMove(move, null, (isValidMove) => {
            if (!isValidMove) {
                    draggedPiece.style.visibility = 'visible';
                    animatePieceBackToSource();
        }});
    }
    else {
        animatePieceBackToSource();
    }

    // clean up
    if (dragGhost) {
        dragGhost.remove();
        dragGhost = null;
    }
    if (!targetSquare) {
        draggedPiece.style.visibility = 'visible';
    }
    setTimeout(() => {
        draggedPiece = null;
    }, 20);
    sourceSquare = null;
}

// Setting up the listener to handle incoming moves
socket.on('update_board', function(data) {
    if (data.success) {
        // castle
        if (data.OO) {
            updateBoard('e1g1');
            updateBoard('h1f1');
            updateCheckSquares(data.bcheck, data.wcheck, data.is_checkmate, data.black, data.white);
        } else if (data.OOO) {
            updateBoard('e1c1')
            updateBoard('a1d1');
            updateCheckSquares(data.bcheck, data.wcheck, data.is_checkmate, data.black, data.white);
        } else if (data.oo) {
            updateBoard('e8g8')
            updateBoard('h8f8');
            updateCheckSquares(data.bcheck, data.wcheck, data.is_checkmate, data.black, data.white);
        } else if (data.ooo) {
            updateBoard('e8c8')
            updateBoard('a8d8');
            updateCheckSquares(data.bcheck, data.wcheck, data.is_checkmate, data.black, data.white);
        }
        else if (data.enpassant) {
            updateBoard(data.move, data.is_checkmate, data.white, data.black, data.wpromotion, data.bpromotion, data.stalemate);
            
            const fromSquare = data.move.slice(0, 2);
            const toSquare = data.move.slice(2);
            let captureSquare = toSquare[0] + (parseInt(fromSquare.charAt(1))).toString();
            const captureElement = document.querySelector(`[data-square='${captureSquare}']`);
            if (captureElement) {
                captureElement.innerHTML = ''; // Clear the captured pawn
                delete boardState[captureSquare];
            }
        }
        // Update the board based on the opponent's move
        else {
            updateBoard(data.move, data.is_checkmate, data.white, data.black, data.wpromotion, data.bpromotion, data.stalemate);
            updateCheckSquares(data.bcheck, data.wcheck, data.is_checkmate, data.black, data.white);
        }
    } else {
        console.error('Error processing move:', data.error);
    }
});




// Send the move to the server
function submitMove(move, square, callback = () => {}) {
    // Emit the move_piece event to the server

    socket.emit('move_piece', { move: move, room: roomid,});

    // Listen for the response from the server
    socket.once('move_response', function(response) {
        if (response.success) {
            // Update the board based on the response data
            callback(true);
        } else {
            errorsound.currentTime = 0;
            errorsound.play()
            callback(false);
            square.classList.remove('selected');
        }
    });
}



function animatePieceBackToSource() {
    const fromElement = document.querySelector(`[data-square='${sourceSquare}']`);
    
    if (draggedPiece) {
        draggedPiece.style.visibility = 'visible';
        draggedPiece.style.transform = '';
        fromElement.appendChild(draggedPiece);
    }
}

function updateCheckSquares(checkb, checkw, checkmate, black, white) {
    const squares = document.querySelectorAll('.checked');
    squares.forEach(square => {
        square.classList.remove('checked');
    });

    if (checkmate == true && black == true) {
        checkw = true;
    }
    else if (checkmate == true && white == true) {
        checkb = true;
    }

    if (checkb) {
        const blackKing = document.querySelector('img[src*="b_king.png"]');
        if (blackKing) {
            checksound.currentTime = 0;
            checksound.play()
            const bKSquare = blackKing.parentElement;
            bKSquare.classList.add('checked');
        }
    }

    else if (checkw) {
        const whiteKing = document.querySelector('img[src*="w_king.png"]');
        if (whiteKing) {
            checksound.currentTime = 0;
            checksound.play()
            const wKSquare = whiteKing.parentElement;
            wKSquare.classList.add('checked');
        }
    }
}
function updateBoard(move, is_checkmate, white, black, wpromotion, bpromotion, stalemate) {
    const squares = document.querySelectorAll('.square')
    squares.forEach(square => {
        square.classList.remove('tosquare');
        square.classList.remove('fromsquare')
    });

    movesound.currentTime = 0;
    movesound.play();

    const fromSquare = move.slice(0, 2);
    const toSquare = move.slice(2);


    var piece = boardState[fromSquare];
    const toElement = document.querySelector(`[data-square='${toSquare}']`);
    const fromElement = document.querySelector(`[data-square='${fromSquare}']`);

    // display where they moved
    toElement.classList.add('tosquare');
    fromElement.classList.add('fromsquare');
    
    
    if (wpromotion == true) {
        piece = 'Q'
    }
    else if (bpromotion == true) {
        piece = 'q'
    }

    if (stalemate == true) {
        matesound.currentTime = 0;
        matesound.play();
        let result = 'Draw!';
    
        // Display the result to both players
        document.getElementById('resultMessage').textContent = result;
        const resultM = new bootstrap.Modal(document.getElementById('resultModal'));
        resultM.show();
    }

    if (is_checkmate == true) {
        matesound.currentTime = 0;
        matesound.play();
        let result = '';
    
        if (white == true) {
            result = 'White Wins By Checkmate!';
        } else if (black == true) {
            result = 'Black Wins By Checkmate!';
        }
    
        // Display the result to both players
        document.getElementById('resultMessage').textContent = result;
        const resultM = new bootstrap.Modal(document.getElementById('resultModal'));
        resultM.show();
    }

    if (toElement && fromElement) {
        // Get positions of the source and target squares for animation
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();

        const img = fromElement.querySelector('img');

        if (img) {
            if (isDragging == false) {
                // Calculate the translation for animation
                const deltaX = toRect.left - fromRect.left;
                const deltaY = toRect.top - fromRect.top;

                // Apply the transform to animate the piece
                img.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

                // Once the transition is over, move the piece to the new square
                setTimeout(() => { 
                    const fromrowlabel = fromElement.querySelector('.col-label')
                    const fromcollablel = fromElement.querySelector('.row-label')

                    const torowlabel = toElement.querySelector('.col-label')
                    const tocollablel = toElement.querySelector('.row-label')

                    toElement.innerHTML = `<img src="/static/images/chess/${pieceImages[piece]}.png" alt="${piece}" class="piece-img">`;
                    
                    const newimg = toElement.querySelector('img');
                    newimg.addEventListener('dragstart', handleDragStart);

                    fromElement.innerHTML = ''; // Clear the from square
                    img.style.transform = ''; // Reset the transform
        
                    if (fromcollablel) {
                        fromElement.appendChild(fromcollablel);
                    } 
                    if (fromrowlabel) {
                        fromElement.appendChild(fromrowlabel);
                    }
                    if (torowlabel) {
                        toElement.appendChild(torowlabel);
                    }
                    if (tocollablel) {
                        toElement.appendChild(tocollablel);
                    }

                    // Update the board state
                    boardState[toSquare] = piece;
                    delete boardState[fromSquare];

                    
                }, 500);
            }
            else {
                    isDragging = false;
                    const fromrowlabel = fromElement.querySelector('.col-label')
                    const fromcollablel = fromElement.querySelector('.row-label')

                    const torowlabel = toElement.querySelector('.col-label')
                    const tocollablel = toElement.querySelector('.row-label')

                    toElement.innerHTML = `<img src="/static/images/chess/${pieceImages[piece]}.png" alt="${piece}" class="piece-img">`;
                    
                    const newimg = toElement.querySelector('img');
                    newimg.addEventListener('dragstart', handleDragStart);

                    fromElement.innerHTML = ''; // Clear the from square
                    img.style.transform = ''; // Reset the transform
        
                    if (fromcollablel) {
                        fromElement.appendChild(fromcollablel);
                    } 
                    if (fromrowlabel) {
                        fromElement.appendChild(fromrowlabel);
                    }
                    if (torowlabel) {
                        toElement.appendChild(torowlabel);
                    }
                    if (tocollablel) {
                        toElement.appendChild(tocollablel);
                    }

                    // Update the board state
                    boardState[toSquare] = piece;
                    delete boardState[fromSquare];
                    
            } 
        }
    }
}

socket.on('opponent_disconnected', function(data) {
    // Display the timer next to the opponent's name
    let timerElement = document.getElementById('opponent-timer');
    timerElement.innerHTML = "Opponent disconnected. Forfeit in: " + countdownTime + " seconds";
    
    // Start the countdown
    disconnectCountdown = setInterval(function() {
        countdownTime -= 1;
        timerElement.innerHTML = "Opponent disconnected. Forfeit in: " + countdownTime + " seconds";
        
        if (countdownTime <= 0) {
            clearInterval(disconnectCountdown);
        }
    }, 1000);
});

// Listen for opponent reconnection
socket.on('opponent_reconnected', function(data) {
    // Clear the countdown if opponent reconnects
    clearInterval(disconnectCountdown);
    document.getElementById('opponent-timer').innerHTML = '';
    countdownTime = 60;  // Reset timer
});

// Listen for opponent forfeiture
socket.on('player_forfeit', function(data) {
    clearInterval(disconnectCountdown);
    document.getElementById('opponent-timer').innerHTML = 'Opponent forfeited.';
    window.location.replace("/");
});

socket.on('draw_noti', function(data) {
    // Update the modal message
    if (asd != 1) {
        document.getElementById('notificationMessage').innerText = data.message;

        // Show the notification modal
        var notificationModal = new bootstrap.Modal(document.getElementById('notificationModal'));
        notificationModal.show();
    }
    asd = 0;
});

socket.on('draw_accepted', function(data) {
    matesound.currentTime = 0;
    matesound.play()
    var drawModal = new bootstrap.Modal(document.getElementById('drawacModal'));
    drawModal.show();
})
document.getElementById('Accept').addEventListener('click', function() {
    socket.emit('draw_accept', { roomid: roomid });
    $('#drawModal').modal('hide'); // Close the modal
});
document.getElementById('Deny').addEventListener('click', function() {
    $('#drawModal').modal('hide'); // Close the modal
});
// Handle the Draw confirmation
document.getElementById('confirmDraw').addEventListener('click', function() {
    asd = 1;
    socket.emit('draw_request', { roomid: roomid });
    $('#drawModal').modal('hide'); // Close the modal
});

// Handle the Forfeit confirmation
document.getElementById('confirmForfeit').addEventListener('click', function() {
    socket.emit('forfeit', { roomid: roomid });
    $('#forfeitModal').modal('hide'); 
});
// Initial board render
$(document).ready(function() {
    renderBoard(boardFen);  // boardFen will be passed from the server-side
});
