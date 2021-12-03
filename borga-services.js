'use strict';

const errorList = require("./borga-errors");

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
		const game = await data_ext.findGames(query);
		return game
	}


	async function addGame(token, groupName, game) {
		const username = await getUsername(token);
		if(!groupName) {
			throw errorList.MISSING_PARAM('group');
		}
		if(!game) {
			throw errorList.MISSING_PARAM('game');
		}
		if(!await data_int.hasGroup(username, groupName)){
			throw errorList.NOT_FOUND("Group " + groupName + " doesn't exist");
		}
		try{
			const gameObj = await data_ext.findGameById(game); 
			if(await data_int.hasGameInGroup(username, groupName, gameObj.id)) {
				throw errorList.FAIL("Game already exists");
			}
			const gameRes = data_int.saveGame(username, groupName, gameObj);
			return gameRes;
		} catch (err) {
			if(err.name === 'NOT_FOUND') {
				throw errorList.INVALID_PARAM("Invalid game: " + game + " : " + err);
			}
			throw err;
		}
	}

	async function getGame(token, gameId, groupName) {
		const username = await getUsername(token);
		const game = data_int.loadGame(
			username,
			groupName,
			gameId
		);
		return game;
	}

	async function deleteGame(token, groupName, game) {
		const username = await getUsername(token);
		if(!groupName) {
			throw errorList.MISSING_PARAM('group');
		}
		if(!game) {
			throw errorList.MISSING_PARAM('game');
		}
		if(!await data_int.hasGroup(username, groupName)){
			throw errorList.NOT_FOUND("Group " + groupName + " doesn't exist");
		}
		try{
			const gameObj = await data_ext.findGameById(game);

			if(!await data_int.hasGameInGroup(username, groupName, gameObj.id)) {
				throw errorList.FAIL("Game doesn't exist");
			}
			const gameRes = data_int.deleteGame(username, groupName, gameObj.id);
			return gameRes;
		} catch (err) {
			if(err.name === 'NOT_FOUND') {
				throw errorList.INVALID_PARAM("Invalid game: " + game + " : " + err);
			}
			throw err;
		}
	}
	

	async function createGroup(token, groupName, groupDesc) {
		const username = await getUsername(token);
		const group = await data_int.createGroup(
			username,
			groupName,
			groupDesc
		)
		return group;
	}

	async function getGroups(token) {
		const username = await getUsername(token);
		const group = await data_int.getGroups(
			username
		)
		return group;
	}

	async function editGroup(token, oldGroupName, newGroupName, newGroupDesc) {
		const username = await getUsername(token);
		const group = await data_int.editGroup(username, oldGroupName, newGroupName, newGroupDesc);
		return group;
	}

	async function getGroupInfo(token, groupName) {
		const username = await getUsername(token);
		if(!groupName) {
			throw errorList.MISSING_PARAM('group');
		}
		if(!await data_int.hasGroup(username, groupName)){
			throw errorList.NOT_FOUND("Group " + groupName + " doesn't exist");
		}
		try {
			const group = await data_int.getGroupInfo(username, groupName);
			return group;
		} catch (err) {
			if(err.name === 'FAIL') {
				throw errorList.INVALID_PARAM(err);
			}
			throw err;
		}
	}

	async function deleteGroup(token, groupName) {
		const username = await getUsername(token);
		const group = await data_int.deleteGroup(
			username,
			groupName,
		)	
		return group;
	}

	async function getPopularGames() {
		try{
			return await data_ext.getPopularGames();
		} catch(err) {
			throw errorList.FAIL('Unnable to retrieve most popular games list')
		}
	}

	return {
		searchGame,
		addGame,
		getGame,
		deleteGame,
		getPopularGames, 
		createGroup,
		getGroups,
		editGroup,
		deleteGroup,
		getGroupInfo,
		createUser: data_int.createUser
	};
};
