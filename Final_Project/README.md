# Duo play arena
#### Video Demo: <https://youtu.be/r_Xzb49NC98>
#### Description:

This Project was created by Benett Palinkas and Mate Palinkas.
GitHub username for Benett: **Benett-t**
edX username for Benett: **b-palinkas**

GitHub username for Mate: **MateP777**
edX username for Mate: **Mate_P77**

#### Overview:
Duo Play Arena is a web-based multiplayer platform where users can play Chess and Tic Tac Toe against each other in real-time. Built using Flask and Socket.IO, this application enables seamless online gaming with user management and game statistics.

## Chess:
Our Chess implementation stays true to the classic rules of the game, and allows players to make all standard moves such as castling, en passant, and pawn promotion. The Chess game is designed for multiplayer using Socket.IO for real-time interaction between players. The frontend of the Chess game is made from scratch allowing precise control over the user interface allowing us to enable dragging and square for moving the pieces. The game ends either by checkmate, stalemate, draw or forfeit. If the opponent left the room a 60 second timer begins counting down till the opponent returns or it reaches zero when it reaches zero the opponent is forced to forfeit. A draw offer can be sent anytime in the game if the opponent accepts the draw the game ends in a tie. The outcome of the game is recorded by the updatewin function this function interacts with the database and changes the values based on the outcome. Furthermore the game has several sound effects allowing for a more immersed user experience. Overall, we have successfully brought the rich, competitive world of Chess to the web.

## Tic Tac Toe:
Welcome to the classic Tic-Tac-Toe game, where you can challenge your friends or other players in a fun, competitive, and interactive experience! The game is played on a traditional 3x3 grid, offering a simple yet engaging gameplay that anyone can enjoy. Whether you're a seasoned strategist or a casual gamer, this version brings both nostalgia and excitement to the web. CSS credit: codebrainer.com
#### Game Logic & Structure
The core game logic is handled on the server side to ensure fairness and consistency across all players. The server maintains a global list of dictionaries, with each dictionary representing a unique game room. Each room stores crucial information such as:
- The current game status
- The current player's turn, ensuring alternating moves between players.
- The players' details, such as their identifiers and move history.
This structure guarantees that each game is properly tracked and managed, while multiple games can run simultaneously on the server.
#### Real-Time Multiplayer with Socket.IO
The multiplayer functionality is powered by Socket.IO, a robust library that facilitates real-time communication between the client and the server. Both the server and the client side are equipped with Socket.IO, enabling seamless and instant updates during gameplay.
When a player makes a move, it is immediately emitted back to the server through a socket event, where the game logic processes the action and updates the game state.
The server sends real-time updates back to the client, including the new game board and the current status of the game, ensuring that all players are synchronized.
#### Dynamic Game Board Rendering
The game board is dynamically rendered on the client side using a JavaScript function, which listens for changes in the game state and updates the UI accordingly. The 3x3 grid is interactive, allowing players to click on empty spots to place their mark (X or O). Once a player clicks on a cell, the move is transmitted to the server, and the game board is refreshed for all participants.
#### Game Over and Statistics
At the conclusion of each game—whether it ends in a win or a tie—the server emits a Game Over message to inform all players that the match has ended. The outcome is recorded and stored in the system for future reference. The game statistics are then updated in the users.db database, tracking each player's performance, including:
- Wins and losses
- Total games played
- Ties and win streaks
This allows users to monitor their progress over time and provides a sense of accomplishment as they compete against others.
#### Summary
In summary, this Tic-Tac-Toe web app combines the simplicity of a classic game with the power of modern web technologies, offering an engaging multiplayer experience. With real-time gameplay powered by Socket.IO, a dynamic, interactive game board, and comprehensive game tracking and statistics, you’re sure to have an enjoyable time playing with others.

### List of files with descriptions:
- app.py contains the Flask web app with user management, game stats and the games itself
- README.md - This readme file
- requirements.txt - Contains all python libraries used for the app
- tictactoe.py - Test application for testing the tictactoe game logic
- users.db - Contains the user data with hashed passwords and statistics for the games in separate tables
- /static
    - /static/images contain the png files for the chess
    - /static/sounds contain the sounds for the games
    - chess.js - contain the javascript frontend for the chess game with
    - tictactoe.js - javascript for the frontend (tictactoe)
    - style.css - main style of the website
- /templates
    - All of the html for the website