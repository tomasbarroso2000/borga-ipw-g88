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
		const game = await data_ext.findGame(query);
		return game
	}


	async function addGame(token, groupName, gameIdArg) {
		if(!gameIdArg) {
			throw errorList.MISSING_PARAM('gameId');
		}
		if(!groupName) {
			throw errorList.MISSING_PARAM('groupName');
		}
		try{
			const username = await getUsername(token)
			if(await data_int.hasGame(username, groupName ,gameIdArg)) {
				return { gameId: gameIdArg};
			}
			const game = await data_ext.getGameById(gameIdArg);
			const gameIdRes = await data_int.saveGame(username, groupName, game);
			return { gameId: gameIdRes}
		} catch (err) {
			if(err.name === 'NOT_FOUND') {
				throw errorList.INVALID_PARAM({ gameId: gameIdArg, err });
			}
			throw err;
		}
	}

	async function getAllGames(token, groupName) {
		const games = await data_int.listGames(
			await getUsername(token),
			groupName
		);
		return games;
	}

	async function getGame(token, gameId, groupName) {
		const game = data_int.loadGame(
			await getUsername(token),
			groupName,
			gameId
		);
		return game;
	}

	async function deleteGame(token, groupName, gameIdArg) {
		const gameId = await data_int.deleteBook(
			await getUsername(token),
			groupName,
			gameIdArg
		);
		return gameId;
	}
	

	async function addGroup(token, groupName, groupDesc) {
		const group = await data_int.createGroup(
			token,
			groupName,
			groupDesc
		)
		return group;
	}

	async function getGroups(token) {
		const group = await data_int.getGroups(
			token
		)
		return group;
	}

	async function editGroup(token, oldGroupName, newGroupName, newGroupDesc) {
		const group = await data_int.editGroup(token, oldGroupName, newGroupName, newGroupDesc);
		return group;
	}

	return {
		searchGame,
		addGame,
		getAllGames,
		getGame,
		deleteGame,
		getPopularGames: data_ext.getPopularGames, //temos de alterar
		addGroup,
		getGroups,
		editGroup
	};
};
