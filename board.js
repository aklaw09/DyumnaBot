import { Black, BoardSize, OffBoard, Pawn, Rook, Knight, Bishop, Queen, King, White, EmptySquare, Sq64To120AbsoluteSq } from "./defs.js";
import { generateMoves, generateThreats } from "./moves.js";
import { searchOptimalMove } from "./search.js";

export function parseFen (fen) {
    let GameBoard = {};
    GameBoard.map = Array(BoardSize).fill(OffBoard);
    GameBoard.activeColor = White;
    GameBoard.fiftyMove = 0;
    GameBoard.hisPly = 0;
    GameBoard.castlingPerm = 0x1111; //KQkq
    GameBoard.enPassantTarget = -1;
    GameBoard.material = Array(2);
    GameBoard.threatMap = Array(64).fill(false);

    var [positionString, activeColor, castlingPerm, enPassantTarget, halfMoves, fullMoves] = fen.split(' '), rawPieceData = positionString.replaceAll('/', '');
    let it = 21; fullMoves = Number(fullMoves);

    GameBoard.pieceList = {
        0: new Map([
            [Pawn, Array(0)],
            [Rook, Array(0)],
            [Knight, Array(0)],
            [Bishop, Array(0)],
            [Queen, Array(0)],
            [King, Array(0)],
        ]),
        1: new Map([
            [Pawn, Array(0)],
            [Rook, Array(0)],
            [Knight, Array(0)],
            [Bishop, Array(0)],
            [Queen, Array(0)],
            [King, Array(0)],
        ]),
    };    


    for(let i = 0; i < rawPieceData.length; i++) {
        let piece = rawPieceData[i]; 
        if(!isNaN(parseInt(piece))) {
            for(let j = 0; j < piece; j++) {
                GameBoard.map[it++] = EmptySquare;
            }
        } else {
            GameBoard.map[it++] = parsePieceData(piece, it-1, GameBoard);
        }
        if(it % 10 === 9) {
            it += 2;
        };
    }

    GameBoard.activeColor = activeColor == "w" ? White : Black;
    if(GameBoard.activeColor === White) {
        if(fullMoves === 1) GameBoard.ply = fullMoves;
        else GameBoard.ply = fullMoves+1;
    }  else {
        if(fullMoves === 1) GameBoard.ply = fullMoves+1;
        else GameBoard.ply = fullMoves+2;
    }
    GameBoard.moveList = Array(GameBoard.ply).fill([]);

    displayBoard(GameBoard);
    generateThreatMap(GameBoard);
    return searchOptimalMove(GameBoard, 1);
}

function displayBoard (GameBoard) {
    let boardString = '';
    for(let i=0; i < 64; i++) {
        let absSq = Sq64To120AbsoluteSq(i)
        typeof GameBoard.map[absSq] === "object" ? boardString += GameBoard.map[absSq].display + '\t': boardString += GameBoard.map[absSq] + '\t'
        if(i%8 === 7 && i) {
            boardString += '\n'
        }
    }
    console.log(boardString)
}

function parsePieceData(display, absoluteSq, GameBoard) {
    let piece = {
        display: display,
        absolutePos: absoluteSq
    }
    display.toLowerCase() !== display ? piece.color = White : piece.color = Black;

    switch(display.toLowerCase()) {
        case 'p':
            piece.type = Pawn;
            piece.value = 100;
            break;

        case 'r':
            piece.type = Rook;
            piece.value = 500;
            break;
        
        case 'n':
            piece.type = Knight;
            piece.value = 275;
            break
        
        case 'b':
            piece.type = Bishop;
            piece.value = 375;
            break;

        case 'q':
            piece.type = Queen;
            piece.value = 900;
            break;
        
        case 'k':
            piece.type = King;
            piece.value = 5000;
            break
    }

    piece.id = GameBoard.pieceList[piece.color].get(piece.type).length;
    GameBoard.pieceList[piece.color].get(piece.type).push(piece);
    return piece;
}

export function generateThreatMap(GameBoard) {
    GameBoard.threatMap.fill(false);
    let color = Number(!GameBoard.activeColor), pieceList = GameBoard.pieceList[color];

    pieceList.forEach((value, key) => {
        value.forEach((piece) => generateThreats(piece, GameBoard));
    })
}

function displayThreatMap(GameBoard) {
    let file = [];
    for(let i=0; i < 64; i++) {
        GameBoard.threatMap[i] ? file.push("x") : file.push(".")
        if(i%8 === 7) {
            console.log(...file);
            file = [];
        }
    }
}