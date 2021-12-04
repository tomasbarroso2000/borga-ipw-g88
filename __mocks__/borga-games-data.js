const errors = require("../borga-responseCodes");


const games = {
    '74f9mzbw9Y': {"id": "74f9mzbw9Y", "name": "Exploding Kittens", "price": "19.82"}
}

const queries = {
    'exploding+kittens': '74f9mzbw9Y'
}

function makeGameObj(gameInfo) {
	return {
		id: gameInfo.id,
		name: gameInfo.name,
		price: gameInfo.price,
	};	
}

async function findGames(query) {
	const gameId = await queries[query];
	return getGameById(gameId)
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

module.exports = {
    games,
    findGames,
    getGameById
}