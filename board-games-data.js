'use strict';

const ATLAS_CLIENT_ID = process.env.ATLAS_CLIENT_ID;
const responseCodes = require('./borga-responseCodes');
const errors = responseCodes.errorList;
const fetch = require('node-fetch');
const HTTP_SERVER_ERROR = 5;
const BOARD_GAME_ATLAS_BASE_URI =
	'https://api.boardgameatlas.com/api/';

async function getMechanics(mechanics) {
	const ids = mechanics.map(data => data.id);
	const search_mechanics_uri = BOARD_GAME_ATLAS_BASE_URI + 'game/mechanics?pretty=true&client_id=' + ATLAS_CLIENT_ID;
	const response = await do_fetch(search_mechanics_uri);
	console.log(response);
	const filtered = response.mechanics.filter(m => ids.includes(m.id));
	const names = filtered.map(data => data.name);
	return names;
}

async function getCategories(categories) {
	const ids = categories.map(data => data.id);
	const search_categories_uri = BOARD_GAME_ATLAS_BASE_URI + 'game/categories?pretty=true&client_id=' + ATLAS_CLIENT_ID;
	const response = await do_fetch(search_categories_uri);
	console.log(response);
	const filtered = response.categories.filter(c => ids.includes(c.id));
	const names = filtered.map(data => data.name);
	return names;
}

function makeGameObj(gameInfo) {
	return {
		id: gameInfo.id,
		name: gameInfo.name,
		price: gameInfo.price,
		discount: gameInfo.discount,
		minimum_players: gameInfo.min_players,
		maximum_players: gameInfo.max_players,
		minimum_age: gameInfo.min_age,
		description: gameInfo.description,
		image: gameInfo.image_url,
		url: gameInfo.url,
		mechanics: gameInfo.mechanics,
		categories: gameInfo.categories
	};
}

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
		return gamesArray
	} else {
		throw errors.NOT_FOUND({ query });
	}
}

module.exports = {
	findGames,
	getPopularGames,
	findGameById,
	getMechanics,
	getCategories
};
