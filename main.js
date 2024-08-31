const BASE_URL = process.env.BASE_URL;
const token = process.env.token;

import axios from 'axios';
import { parseFen } from './board.js';
  
var activeGames = new Map();

const lichess = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
        'Connection': 'keep-alive'
    }
})

getOngoingGames();
setInterval(getOngoingGames, 3000)

lichess.get('/challenge').then((res) => {
    const challenges = res.data.in;
    for(let challenge of challenges) {
        startGame(challenge.id);
    }
})

function startGame (challengeid) {
    lichess.post(`/challenge/${challengeid}/accept`).then(res => console.log(res.data))
}

function getOngoingGames () {
    lichess.get('/account/playing').then(res => {
        const gamesList = res.data.nowPlaying;
        for(let game of gamesList) {
            activeGames.set(game.gameId, game);
            if(game.isMyTurn) {
                playTurn(game)
            }
        }
    })
}

function streamGame(gameId) {

}

function playTurn(game) {
    console.log('Playing turn..')
    let move = parseFen(game.fen)
    lichess.post(`/bot/game/${game.gameId}/move/${move}`)
}

//todo: add pinned piece
/*
pinned pieces are essentially pieces which come in line of attack of a sliding piece (queen, rook, bishop)
first check if king is present in any direction, i.e. diagonal, vertical and horizontal
if yes, also check if an opp piece is present in the same direction
it is important that the king and the attacking piece have to be in the same direction, otherwise the piece may not be pinned
*/