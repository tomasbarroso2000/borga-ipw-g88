'use strict';

const ATLAS_CLIENT_ID = process.env.ATLAS_CLIENT_ID;
const responseCodes = require('./borga-responseCodes');
const errors = responseCodes.errorList;
const successes = responseCodes.successList;
const fetch = require('node-fetch');
const BOARD_GAME_ATLAS_BASE_URI = 
	'https://api.boardgameatlas.com/api/';

function makeGameObj(gameInfo) {
	return {
		id: gameInfo.id,
		name: gameInfo.name,
		price: gameInfo.price,
	};	
}

async function do_fetch(uri) {
	let res;
	try {
		res = await fetch(uri);
	} catch (err) {
		throw errors.EXT_SVC_FAIL(err);
	}
	if (res.ok) {
		return res.json();
	} else {
		return res.json().then(errDesc => {
			throw errors.EXT_SVC_FAIL({ res, errDesc });
		});
	}	
}

async function findGames(query) {
	const gamesArray = [];
	const search_uri = BOARD_GAME_ATLAS_BASE_URI + 'search?name=' + query + '&client_id=' + ATLAS_CLIENT_ID;
	const answer = await do_fetch(search_uri);
	if (answer.games && answer.games.length) {
		answer.games.forEach(elem => {
			gamesArray.push(makeGameObj(elem));
		})
		return gamesArray
	} else {
		return null;
	}
}

async function findGameById(query) {
	const search_uri = BOARD_GAME_ATLAS_BASE_URI + 'search?limit=1&ids=' + query + '&client_id=' + ATLAS_CLIENT_ID;
	const answer = await do_fetch(search_uri);
	if (answer.games && answer.games.length) {
		return makeGameObj(answer.games[0]);
	} else {
		return null;
	}
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

async function getGameById(gameId) {
	const game_uri = BOARD_GAME_ATLAS_BASE_URI + 'search?ids=' + gameId + '&limit=1&client_id=' + ATLAS_CLIENT_ID;
	const data = await do_fetch(game_uri);
	return makeGameObj(data.games[0]);
}

module.exports = {
	findGames,
	getPopularGames,
	getGameById, 
	findGameById
};
