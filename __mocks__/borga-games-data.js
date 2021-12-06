const errors = require("../borga-responseCodes");


const games = {
    '74f9mzbw9Y': {"id": "74f9mzbw9Y", "name": "Exploding Kittens", "price": "19.82"}
}

const queries = {
    'exploding+kittens': [games['74f9mzbw9Y']]
}

function makeGameObj(gameInfo) {
	return {
		id: gameInfo.id,
		name: gameInfo.name,
		price: gameInfo.price,
	};	
}

async function findGames(query) {
	return queries[query];
}

async function findGameById(query) {
	return getGameById(query);
}


async function getGameById(gameId) {
	const game = await games[gameId];
	if(!game){
		throw errors.errorList.NOT_FOUND(gameId);
	}
	return makeGameObj(game);
}

async function getPopularGames() {
	return [
		{"id":"TAAifFP590","name":"Root","price":"0.00"},
		{"id":"yqR4PtpO8X","name":"Scythe","price":"54.92"}
	]
}

module.exports = {
    games,
    findGames,
    getGameById,
	getPopularGames,
	findGameById
}