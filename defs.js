export const OffBoard = 100, EmptySquare = '.', Pawn = 1, Rook = 2, Knight = 3, Bishop = 4, Queen = 5, King = 6;
export const CheckMate = 30000;
export const BoardSize = 120;
export const White = 1, Black = 0;
export const StartingFEN = "rnbqkbnr/pppppppp/7P/8/8/8/1PPPPPPP/RNBQKBNR w KQkq e3 0 1";
const KnightDirections = [-9,-10,-11,-1], BishopDirections = [-10,-1], RookDirections = [-9, -11], PawnDirections = KnightDirections;
const pinnedDirections = []; pinnedDirections[Pawn] = PawnDirections;
pinnedDirections[Knight] = KnightDirections; pinnedDirections[Bishop] = BishopDirections; pinnedDirections[Rook] = RookDirections;

export function isPinned (piece, GameBoard) {
    let map = GameBoard.map, directions = pinnedDirections[piece.type], pivot = piece.absolutePos;
    let iteratorFlag = Array(pinnedDirections[piece.type].size).fill(true);

    for(let i=0; i < directions.length; i++) {
        let nextSq = pivot + directions[i], slidingPieceAttack = false, coveringKing = false;
        while(iteratorFlag[i]) {
            if(isSquareValidBounds(nextSq, GameBoard)) {
                if(typeof map[nextSq] === "object") {
                    let nextPiece = map[nextSq];
                    if(nextPiece.color !== piece.color && (
                        nextPiece.type === Queen || nextPiece.type === Bishop || nextPiece.type === Rook
                    )) {
                        slidingPieceAttack = true;
                        if(coveringKing) return true;
                        else {
                            directions[i] *= -1;
                            nextSq = pivot;    
                        }
                    }
                    if(nextPiece.color === piece.color) {
                        if(nextPiece.type === King) {
                            coveringKing = true;
                            if(slidingPieceAttack) return true;
                            else {
                                directions[i] *= -1;
                                nextSq = pivot;
                            }
                        }
                    } 
                }
                if(coveringKing && slidingPieceAttack) return true;
                nextSq += directions[i]
            } else {
                iteratorFlag[i] = false;
            }
        }
    }
    return false;
}

export function Sq64To120AbsoluteSq(sq) {
    let file = sq%8+1, rank = Math.floor(sq/8)+2;
    return Number(`${rank}${file}`)
}

export function Absolute120To64Sq(sq) {
    let file = 8*(Math.floor(sq/10) -2), rank = sq  % 10 - 1;
    return file+rank;
}

export function sq64ToBoardRep(sq) {
    let file = String.fromCharCode((sq % 8) + 97), rank = 8 - Math.floor(sq/8);
    return `${file}${rank}`
}

export function isSquareValidBounds(sq, GameBoard) {
    return GameBoard.map[sq] === OffBoard ? false : true;
}

export function squareEmpty(sq, GameBoard) {
    return GameBoard.map[sq] === EmptySquare ? true : false;
}

export function isSqAttacked (absolutePos, GameBoard) {
    return GameBoard.threatMap[Absolute120To64Sq(absolutePos)];
}

export function convertToUCI (move) {
    let [from, to] = move.split(':');
    from = Absolute120To64Sq(Number(from)), to = Absolute120To64Sq(Number(to));
    return `${sq64ToBoardRep(from)}${sq64ToBoardRep(to)}`
}


const PawnTable = [
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,
    10	,	10	,	0	,	-10	,	-10	,	0	,	10	,	10	,
    5	,	0	,	0	,	5	,	5	,	0	,	0	,	5	,
    0	,	0	,	10	,	20	,	20	,	10	,	0	,	0	,
    5	,	5	,	5	,	30	,	30	,	5	,	5	,	5	,
    10	,	10	,	10	,	20	,	20	,	10	,	10	,	10	,
    20	,	20	,	20	,	10	,	10	,	20	,	20	,	20	,
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	
    ];
    
    
const KnightTable = [
0	,	-10	,	0	,	0	,	0	,	0	,	-10	,	0	,
0	,	0	,	0	,	5	,	5	,	0	,	0	,	0	,
0	,	0	,	10	,	10	,	10	,	10	,	0	,	0	,
0	,	0	,	10	,	20	,	20	,	10	,	5	,	0	,
5	,	10	,	15	,	20	,	20	,	15	,	10	,	5	,
5	,	10	,	10	,	20	,	20	,	10	,	10	,	5	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0		
];

const BishopTable = [
0	,	0	,	-10	,	0	,	0	,	-10	,	0	,	0	,
0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	
];

const RookTable = [
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
25	,	25	,	25	,	25	,	25	,	25	,	25	,	25	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0		
];

const QueenTable = RookTable.map((val) => val/2);

const KingTable = Array(64).fill(1);

export const Mirror64 = [
    56	,	57	,	58	,	59	,	60	,	61	,	62	,	63	,
    48	,	49	,	50	,	51	,	52	,	53	,	54	,	55	,
    40	,	41	,	42	,	43	,	44	,	45	,	46	,	47	,
    32	,	33	,	34	,	35	,	36	,	37	,	38	,	39	,
    24	,	25	,	26	,	27	,	28	,	29	,	30	,	31	,
    16	,	17	,	18	,	19	,	20	,	21	,	22	,	23	,
    8	,	9	,	10	,	11	,	12	,	13	,	14	,	15	,
    0	,	1	,	2	,	3	,	4	,	5	,	6	,	7
];
    
export const PositionMap = [[], PawnTable, RookTable, KnightTable, BishopTable, QueenTable, KingTable];
