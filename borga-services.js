'use strict';

const errorList = require("./app-errors");

module.exports = function(data_ext, data_int) {
	
	async function getUsername(token) {
		if(!token){
			throw errorList.UNAUTHENTICATED('no token');
		}
		const username = await data_int.tokenToUsername(token);
		if(!username) {
			throw errorList.UNAUTHENTICATED('invalid token');
		}
		return username;
	}

	async function searchGame(query) {
		if(!query) {
			throw errorList.MISSING_PARAM('query');
		}
		const book = await data_ext.findGame(query);
		return book
	}


	async function addGame(token, gameIdArg) {
		if(!gameIdArg){
			throw errorList.MISSING_PARAM('gameId')
		}
		try{
			const username = await getUsername(token)
			if(await data_int.hasGame(username, gameIdArg)) {
				return { gameId: gameIdArg};
			}
			const game = await data_ext.getGameById(gameIdArg);
			const gameIdRes= await data_int.saveGame(username, game);
			return { gameId: gameIdRes}
		} catch (err) {
			if(err.name === 'NOT_FOUND') {
				throw errorList.INVALID_PARAM({ gameId: gameIdArg, err });
			}
			throw err;
		}
	}

	async function getAllGames(token) {
		const game = await data_int.listGames(
			await getUsername(token)
		);
		return { game };
	}

	async function getGame(token, gameId) {
		const game = data_int.loadGame(
			await getUsername(token),
			gameId
		);
		return { game };
	}

	async function deleteGame(token, gameIdArg) {
		const gameId = await data_int.deleteBook(
			await getUsername(token),
			gameIdArg
		);
		return { gameId };
	}
	

	return {
		searchGame,
		addGame,
		getAllGames,
		getGame,
		deleteGame,
		getPopularGames: data_ext.getPopularGames, //temos de alterar
	};
};
