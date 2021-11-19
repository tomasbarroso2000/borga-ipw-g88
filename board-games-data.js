'use strict';

const ATLAS_CLIENT_ID = process.env.ATLAS_CLIENT_ID;
const errors = require('./app-errors');
const fetch = require('node-fetch');
const BOARD_GAME_ATLAS_BASE_URI = 
	'https://api.boardgameatlas.com/api/';


/* denecessário (?)
function findId(info, type) {
	return info.industryIdentifiers &&
		info.industryIdentifiers
		.filter(iid => iid.type === type)
		.map(iid => iid.identifier)
		.concat(undefined)[0];
}
*/

function makeGameObj(gameInfo) {
	console.log(gameInfo);
	return {
		id: gameInfo.id,
		name: gameInfo.name,
		price: gameInfo.price,
		categories: gameInfo.categories
	};	
}

function do_fetch(uri) {
	console.log(uri);
	return fetch(uri)
		.catch(err => {
			throw errors.EXT_SVC_FAIL(err);
		})
		.then(res => {
			if (res.ok) {
				return res.json();
			} else {
				return res.json().then(errDesc => {
					throw errors.EXT_SVC_FAIL({ res, errDesc });
				});
			}
		});	
}

function findGame(query) {
	const search_uri = BOARD_GAME_ATLAS_BASE_URI + 'search?name=' + query + '&client_id=' + ATLAS_CLIENT_ID;
	console.log(search_uri);
	return do_fetch(search_uri)
		.then(answer => {
			if (answer.games && answer.games.length) {
				return makeGameObj(answer.games[0]);
			} else {
				return null;
			}
		});
}

async function getPopularGames() {
	const search_uri = BOARD_GAME_ATLAS_BASE_URI + 'search?order_by=rank&ascending=false&client_id=' + ATLAS_CLIENT_ID;
	const answer = await do_fetch(search_uri);
	if (answer.games && answer.games.length) {
		let gamesArray = [];
		answer.games.forEach(element => {
			gamesArray.push(makeGameObj(element));
		});
		return gamesArray;
	} else {
		return null;
	}
}

function getGameById(gameId) {
	const game_uri = BOARD_GAME_ATLAS_BASE_URI + 'search?ids=' + gameId + '&limit=1&client_id=' + ATLAS_CLIENT_ID;
	return do_fetch(game_uri).then(data => {
		console.log(data[0]);
		return makeGameObj(data[0]);
	});
}

module.exports = {
	findGame,
	getPopularGames,
	getGameById
};
