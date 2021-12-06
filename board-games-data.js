'use strict';

const ATLAS_CLIENT_ID = process.env.ATLAS_CLIENT_ID;
const responseCodes = require('./borga-responseCodes');
const errors = responseCodes.errorList;
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

const HTTP_SERVER_ERROR = 5;

function getStatusClass(statusCode) {
	return ~~(statusCode / 100);
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
		if (res.status === 404) {
			throw errors.NOT_FOUND(uri);
		}
		if (getStatusClass(res.status) === HTTP_SERVER_ERROR) {
			return res.json()
				.catch(err => err)
				.then(info => { throw errors.EXT_SVC_FAIL(info); });
		} else {
			throw errors.FAIL(res);
		}
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
		throw errors.NOT_FOUND({ query });
	}
}

async function findGameById(query) {
	const search_uri = BOARD_GAME_ATLAS_BASE_URI + 'search?limit=1&ids=' + query + '&client_id=' + ATLAS_CLIENT_ID;
	const answer = await do_fetch(search_uri);
	if (answer.games && answer.games.length) {
		return makeGameObj(answer.games[0]);
	} else {
		throw errors.NOT_FOUND({ query });
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
		throw errors.NOT_FOUND({ query });
	}
}

module.exports = {
	findGames,
	getPopularGames,
	findGameById
};
