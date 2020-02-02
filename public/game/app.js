//chess vars
var board = null
var game = new Chess();
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')


document.addEventListener("DOMContentLoaded", event => {
    //read url
    let params = new URLSearchParams(location.search);
    const urldata = params.get('gameid');
    player = params.get('c')
    if (urldata === null) {
        window.location.href = '/404.html';
    };

    //set up firebase
    const app = firebase.app();
    const db = firebase.firestore();
    cgame = db.collection('games').doc(urldata);

    //load site
    cgame.onSnapshot(doc => {
        data = doc.data();
        if (data === undefined) {
            window.location.href = '/404.html'
        } else {
            //load fen from db
            game.load(data.fen)
            updateStatus()
            if (player === 'white' || player === 'w') {
                $('#surl').html(`${window.location.host}/game/?gameid=${urldata}&c=b`)
            }
        }
    })
});



//chess js
function onDragStart(source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false


    // only pick up pieces for the side to move
    if ((orientation === 'white' && piece.search(/^w/) === -1) ||
        (orientation === 'black' && piece.search(/^b/) === -1)) {
        return false
    }
}

function onDrop(source, target) {
    // see if the move is legal
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })

    // illegal move
    if (move === null) return 'snapback'

    updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
    board.position(game.fen())
}

function updateStatus() {
    var status = ''
    var moveColor = 'White'

    //updates db
    board.position(game.fen(), false)
    cgame.set({
        fen: game.fen()
    })

    if (player === 'b') {
        board.orientation('black')
    } else if (player === 'w') {
        board.orientation('white')
    } else {
        window.location.href = '/404.html';
    }

    //game turn updater
    if (game.turn() === 'b') {
        moveColor = 'Black'
    } else {
        moveColor = 'White'
    }

    // checkmate?
    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.'
    }

    // draw?
    else if (game.in_draw()) {
        status = 'Game over, drawn position'
    }

    // game still on
    else {
        status = moveColor + ' to move'

        // check?
        if (game.in_check()) {
            status += ', ' + moveColor + ' is in check'
        }
    }

    //set status
    $status.html(status)
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: 'https://koblenski.github.io/javascript/chessboardjs-0.3.0/img/chesspieces/wikipedia/{piece}.png',
}

//define board
board = Chessboard('myBoard', config)