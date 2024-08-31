import { Black, BoardSize, OffBoard, Pawn, Rook, Knight, Bishop, Queen, King, White, EmptySquare, Absolute120To64Sq, 
    squareEmpty, isSqAttacked, isSquareValidBounds, 
	isPinned} from "./defs.js";
import { makeMove } from "./search.js";

export function generateMoves(GameBoard) {
    let activeSide = GameBoard.activeColor, pieceMap = GameBoard.map, pieceList = GameBoard.pieceList[activeSide], iteratorFlag;

    //check if the king is attacked, if yes : generate moves which will stop the threat
	if(GameBoard.pieceList[activeSide].get(King).length === 0) {
		return;
	}
    let kingSq = GameBoard.pieceList[activeSide].get(King)[0].absolutePos, check = false;
    if(isSqAttacked(kingSq, GameBoard)) {
		check = true;
	}
    

    for(let pieceTypeList of pieceList) {
        let [type, collection] = pieceTypeList;
        
        switch(type) {
            case Pawn:
                for(var piece of collection) {
					if(isPinned(piece, GameBoard)) continue;
                    var direction = 1, pivot = Number(piece.absolutePos);      activeSide === White ? direction = -1 : direction = 1;
                    let  lDiagonalSq = pivot + 11*direction, rDiagonalSq = pivot + 9*direction;
                    //Todo: enpassant

                    if(isSquareValidBounds(lDiagonalSq, GameBoard) !== undefined && !squareEmpty(lDiagonalSq, GameBoard) && pieceMap[lDiagonalSq].color === Number(!activeSide) ) {
                        if(check) {
                            let newBoard = makeMove(GameBoard, `${pivot}:${lDiagonalSq}:1`);
                            if(isSqAttacked(kingSq, newBoard) === false) addACaptureMove(pivot, lDiagonalSq, GameBoard);
                            newBoard = GameBoard;
                        } else {
                            addACaptureMove(pivot, lDiagonalSq, GameBoard)
                        }
                    }
                    if(isSquareValidBounds(rDiagonalSq, GameBoard) !== undefined && !squareEmpty(rDiagonalSq, GameBoard) && pieceMap[rDiagonalSq].color === Number(!activeSide)) {
                        if(check) {
                            let newBoard = makeMove(GameBoard, `${pivot}:${rDiagonalSq}:1`);
                            if(isSqAttacked(kingSq, newBoard) === false)	addACaptureMove(pivot, rDiagonalSq, GameBoard)
                            newBoard = GameBoard;
                        } else {
                            addACaptureMove(pivot, rDiagonalSq, GameBoard)
                        }
                    }
                    
                    direction *= 10;
                    let nextSq = pivot + direction;
                    if(isSquareValidBounds(nextSq, GameBoard) && squareEmpty(nextSq, GameBoard)) {
						if(check) {
                            let newBoard = makeMove(GameBoard, `${pivot}:${nextSq}:0`);
                            if(isSqAttacked(kingSq, newBoard) === false)	addAQuietMove(pivot, nextSq, GameBoard);
                            newBoard = GameBoard;
                        } else {
							addAQuietMove(pivot, nextSq, GameBoard);

                        }
                        nextSq += direction;
                        if(activeSide === White) { 
                            if(Math.floor(pivot/10) === 8 && isSquareValidBounds(nextSq, GameBoard) && squareEmpty(nextSq, GameBoard)) {
                                if(check) {
									let newBoard = makeMove(GameBoard, `${pivot}:${nextSq}:0`);
									if(isSqAttacked(kingSq, newBoard) === false)	addAQuietMove(pivot, nextSq, GameBoard);
									newBoard = GameBoard;
								} else {
									addAQuietMove(pivot, nextSq, GameBoard);
		
								}
                            }
                        }else {
                            if(Math.floor(pivot/10) === 3 && isSquareValidBounds(nextSq, GameBoard) && squareEmpty(nextSq, GameBoard)) {
                                if(check) {
									let newBoard = makeMove(GameBoard, `${pivot}:${nextSq}:0`);
									if(isSqAttacked(kingSq, newBoard) === false)	addAQuietMove(pivot, nextSq, GameBoard);
									newBoard = GameBoard;
								} else {
									addAQuietMove(pivot, nextSq, GameBoard);
		
								}
                            }
                        }
                    }
                }
                
                break;
    
            case Rook:
                for(piece of collection) {
                    if(isPinned(piece, GameBoard)) continue;
                    direction = [10, 1, -1, -10], iteratorFlag = Array(direction.length).fill(true);
                    iterateAlongAllDirections_Move(piece, direction, iteratorFlag, GameBoard)    
                }
                break;
    
            case Knight:
                for(piece of collection) {
                    if(isPinned(piece, GameBoard)) continue;
                    direction = [-19, -8, 12, 21, 19, 8, -12, -21];
                    iterateAlongAllDirections_Move(piece, direction, undefined, GameBoard);    
                }
                break;
    
            case Bishop:
                for(piece of collection) {
                    if(isPinned(piece, GameBoard)) continue;
                    direction = [9, 11, -9, -11], iteratorFlag = Array(direction.length).fill(true);
                    iterateAlongAllDirections_Move(piece, direction, iteratorFlag, GameBoard)
                }
                break;
    
            case Queen:
                for(piece of collection) {
                    direction = [9, 11, -9, -11, 10, 1, -1, -10], iteratorFlag = Array(direction.length).fill(true);
                    iterateAlongAllDirections_Move(piece, direction, iteratorFlag, GameBoard)
                    }
                break;
    
            case King:
                direction = [1,-1,10,-10,9,-9,-11,11];
                if(collection[0])
                    iterateAlongAllDirections_Move(collection[0], direction, undefined,  GameBoard);
                break;
        }
    }
}

function iterateAlongAllDirections_Move(piece, directions, iteratorFlag, GameBoard) {
    let pivot = piece.absolutePos,  map = GameBoard.map, kingSq = GameBoard.pieceList[GameBoard.activeColor].get(King)[0].absolutePos, check=false;
	if(isSqAttacked(kingSq, GameBoard)) check = true;

    for(let i=0; i < directions.length; i++) {
        let nextSq = Number(pivot);
        if(iteratorFlag) {
            while(iteratorFlag[i]) {
                nextSq += directions[i];   let nextPiece = map[nextSq];
                if(isSquareValidBounds(nextSq, GameBoard)) {
                    if(typeof nextPiece === "object") {
                        if(nextPiece.color !== piece.color) {
							if(check) {
								let newBoard = makeMove(GameBoard, `${pivot}:${nextSq}:1`);
								if(isSqAttacked(kingSq, newBoard) === false)	addACaptureMove(pivot, nextSq, GameBoard);
								newBoard = GameBoard;
							} else {
								addACaptureMove(pivot, nextSq, GameBoard);
	
							}
						}
                        
                        iteratorFlag[i] = false;
                    }  else {
                        if(isSqAttacked(nextSq, GameBoard) === false) {
							if(check) {
								let newBoard = makeMove(GameBoard, `${pivot}:${nextSq}:0`);
								if(isSqAttacked(kingSq, newBoard) === false)	addAQuietMove(pivot, nextSq, GameBoard);
								newBoard = GameBoard;
							} else {
								addAQuietMove(pivot, nextSq, GameBoard);	
							}
                            
                        }
                    }
                } else iteratorFlag[i] = false;
            }
    
        } else {
            nextSq += directions[i];
            if(isSquareValidBounds(nextSq, GameBoard)) {
                if(map[nextSq] !== EmptySquare ) {
                    if(map[nextSq].color !== piece.color) {
						if(check) {
							let newBoard = makeMove(GameBoard, `${pivot}:${nextSq}:1`);
							if(isSqAttacked(kingSq, newBoard) === false)	addACaptureMove(pivot, nextSq, GameBoard);
							newBoard = GameBoard;
						} else {
							addACaptureMove(pivot, nextSq, GameBoard);	
						}
                        
                    }
                }   else {
					if(check) {
						let newBoard = makeMove(GameBoard, `${pivot}:${nextSq}:0`);
						if(isSqAttacked(kingSq, newBoard) === false)	addAQuietMove(pivot, nextSq, GameBoard);
						newBoard = GameBoard;
					} else {
						addAQuietMove(pivot, nextSq, GameBoard);	
					}
                    addAQuietMove(pivot, nextSq, GameBoard);
                }
            }
        }
    }
}

function addACaptureMove(from, to, GameBoard) {
    // console.log(`Captured:${from}:${to}`)
    let capturedPiece = GameBoard.map[to];
    GameBoard.moveList[GameBoard.ply-1].push(`${from}:${to}:1`);
}

function addAQuietMove(from, to, GameBoard) {
    // console.log(`${from}:${to}`)
    GameBoard.moveList[GameBoard.ply-1].push(`${from}:${to}:0`);
}

export function generateThreats(piece, GameBoard) {
    let type = piece.type, pivot = piece.absolutePos, color = piece.color;

    switch(type) {
        case Pawn:
            var direction = 1, iteratorFlag;      color === White ? direction = -1 : direction = 1;
            let  lDiagonalSq = pivot + 11*direction, rDiagonalSq = pivot + 9*direction;
            if(isSquareValidBounds(lDiagonalSq, GameBoard)) GameBoard.threatMap[Absolute120To64Sq(lDiagonalSq)] = true;
            if(isSquareValidBounds(rDiagonalSq, GameBoard)) GameBoard.threatMap[Absolute120To64Sq(rDiagonalSq)] = true;
            break;

        case Rook:
            direction = [10, 1, -1, -10], iteratorFlag = Array(direction.length).fill(true);
            iterateAlongAllDirections_Threats(piece, direction, iteratorFlag, GameBoard)
            break;

        case Knight:
            direction = [-19, -8, 12, 21, 19, 8, -12, -21];
            iterateAlongAllDirections_Threats(piece, direction,undefined, GameBoard)
            break;

        case Bishop:
            direction = [9, 11, -9, -11], iteratorFlag = Array(direction.length).fill(true);
            iterateAlongAllDirections_Threats(piece, direction, iteratorFlag, GameBoard)
            break;

        case Queen:
            direction = [9, 11, -9, -11, 10, 1, -1, -10], iteratorFlag = Array(direction.length).fill(true);
            iterateAlongAllDirections_Threats(piece, direction, iteratorFlag, GameBoard)
            break;

        case King:
            direction = [1,-1,10,-10,9,-9,-11,11];
            iterateAlongAllDirections_Threats(piece, direction, undefined, GameBoard);
            break;
    }
}

function iterateAlongAllDirections_Threats(piece, directions, iteratorFlag, GameBoard) {
    let pivot = piece.absolutePos,  map = GameBoard.map;

    for(let i=0; i < directions.length; i++) {
        let nextSq = Number(pivot);
        if(iteratorFlag) {
            while(iteratorFlag[i]) {
                nextSq += directions[i];   let nextPiece = map[nextSq];
                if(isSquareValidBounds(nextSq, GameBoard)) {
                    GameBoard.threatMap[Absolute120To64Sq(nextSq)] =true;
                    if(nextPiece !== EmptySquare && nextPiece.color !== piece.color) {
						GameBoard.threatMap[Absolute120To64Sq(nextSq)] = true;
						iteratorFlag[i] = false;
					}
                } else iteratorFlag[i] = false;
            }
    
        } else {
            nextSq += directions[i];
            if(isSquareValidBounds(nextSq, GameBoard)) {
                GameBoard.threatMap[Absolute120To64Sq(nextSq)] =true;
            }
        }
    }
}

function displayMoves(GameBoard) {
    let moveList = GameBoard.moveList[GameBoard.ply-1];
    for(move of moveList) console.log(move)
}