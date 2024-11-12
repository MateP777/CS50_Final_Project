game_rooms = []

game = {
    'room_id' : 'None',
    'current_turn' : 'None',
    'player_1' : 'None',
    'palyer_2' : 'None',
    'private' : 'None',
    'board_state' : [[' ']*3]*3
    }

board = [
    [' ',' ',' '],
    [' ',' ',' '],
    [' ',' ',' ']
]

turn = 'X'

def move():

    global turn

    H = int(input(f"Horizontal coordinate for {turn}: "))

    V = int(input(f"Vertical cooordinate for {turn}: "))

    try:
        if board[V][H] == ' ':
            board[V][H] = turn
            if turn == 'X':
                turn = 'O'
            else:
                turn = 'X'

        else:
            print("Invalid move")
    except IndexError:
        print("Move is out of range")


def check_win(board):

    #check each row

    for row in board:
        if row[0] == row[1] == row[2] and row[0] != ' ':
            return row[0]
        
    #check each column

    for col in range(3):
        if board[0][col] == board[1][col] == board[2][col] and board[0][col] != ' ':
            return board[0][col]
        
    # check diagonal

    if board[0][0] == board[1][1] == board[2][2] and board[0][0] != ' ':
        return board[0][0]
    if board[0][2] == board[1][1] == board[2][0] and board[0][2] != ' ':
        return board[0][2]
    
    return None

def check_tie(board):
    # Check if there's a winner
    if check_win(board) is not None:
        return False
    
    # Check if all cells are filled
    for row in board:
        if ' ' in row: 
            return False
        
    return True

while check_win(board) is None and check_tie(board) is False:
    print("    0    1    2")
    print(f" 0{board[0]}\n\n 1{board[1]}\n\n 2{board[2]}\n")
    move()
else:
    winner = check_win(board)
    if winner:
        print(f"The winner is {winner}!")
        print("    0    1    2")
        print(f" 0{board[0]}\n\n 1{board[1]}\n\n 2{board[2]}\n")
    elif check_tie(board):
        print("The game is a tie!")
        print("    0    1    2")
        print(f" 0{board[0]}\n\n 1{board[1]}\n\n 2{board[2]}\n")

class Board:
    def __init__(self) -> None:
        pass