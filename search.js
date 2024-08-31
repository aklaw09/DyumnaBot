import { generateThreatMap } from "./board.js";
import { Black, BoardSize, OffBoard, Pawn, Rook, Knight, Bishop, Queen, King, White, EmptySquare, Absolute120To64Sq, 
    PositionMap, Mirror64, 
    convertToUCI} from "./defs.js";
import { generateMoves } from "./moves.js";

var oldAlpha, BestMove;

export function searchOptimalMove(GameBoard, depth) {console.log("Searching optimal move....")
    let alpha = -Infinity, beta = Infinity;
    oldAlpha = alpha;
    let res = alphabeta(GameBoard, alpha, beta, depth);
    console.log(convertToUCI(BestMove), res.val)
    return convertToUCI(BestMove);
}

function alphabeta(GameBoard, alpha, beta, depth) {
    if(depth == 0) return evaluate(GameBoard);

    generateMoves(GameBoard);
    let moves = GameBoard.moveList[GameBoard.ply-1], bestMove = "";
    for(let i=0; i < moves.length; i++) {
        let newBoard = makeMove(GameBoard, moves[i]);
        let lastPlayedColor = GameBoard.activeColor;
        let currScore = alphabeta(newBoard, -beta, -alpha, depth-1).val*-1;

        newBoard = GameBoard;

        if(currScore > alpha) {
            if(currScore >= beta) {
                return beta;
            }
            bestMove = moves[i];
            alpha = currScore;
        }
    }

    if(alpha !== oldAlpha) {
        BestMove = bestMove;
    }
    let res = {move : bestMove, val: alpha}
    return res;
}

export function makeMove(GameBoard, move) {
    let newState = structuredClone(GameBoard), oppositeSide = Number(!newState.activeColor), color = GameBoard.activeColor;
    newState.moveList[newState.ply++] = [];
    const [from, to, capturedFlag] = move.split(":");
    
    if(capturedFlag == 1) {
        let piece = newState.map[to], pieceTypeCollectn = newState.pieceList[oppositeSide].get(piece.type);
        pieceTypeCollectn.splice(piece.id, 1)
        newState.pieceList[oppositeSide].set(piece.type, pieceTypeCollectn)
    }

    let movingPiece = newState.map[from];
    newState.map[to] = movingPiece; newState.map[from] = EmptySquare;
    movingPiece.absolutePos = Number(to);
    newState.activeColor = oppositeSide
    generateThreatMap(newState);
    return newState;
}

function evaluate(GameBoard) {
    let materialWhite=0, materialBlack=0;

    let whitePieces = GameBoard.pieceList[White];
    whitePieces.forEach((type,key) => {
        if(key === Bishop && type.length >= 2) materialWhite += 40;
        type.forEach((piece) => {
            let sq = Absolute120To64Sq(piece.absolutePos);
            materialWhite += piece.value + PositionMap[piece.type][sq];
        })
    })

    let blackPieces = GameBoard.pieceList[Black];
    blackPieces.forEach((type, key) => {
        if(key === Bishop && type.length >= 2) materialBlack += 40;
        type.forEach(piece => {
            let sq = Mirror64[Absolute120To64Sq(piece.absolutePos)];
            materialBlack += piece.value + PositionMap[piece.type][sq];
        })
    })

    return {bestMove: '', val: materialWhite - materialBlack};
}