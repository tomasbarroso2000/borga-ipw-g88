
const games = {
    '74f9mzbw9Y': {"id": "74f9mzbw9Y", "name": "Exploding Kittens", "price": "19.82"}
}

const queries = {
    'exploding+kittens': '74f9mzbw9Y'
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


async function getGameById(gameId) {
	const game_uri = BOARD_GAME_ATLAS_BASE_URI + 'search?ids=' + gameId + '&limit=1&client_id=' + ATLAS_CLIENT_ID;
	const data = await do_fetch(game_uri);
	return makeGameObj(data.games[0]);
}

module.exports = {
    games,
    findGames,
    getGameById
}