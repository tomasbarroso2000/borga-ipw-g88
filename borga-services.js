'use strict';

const responseCodes = require('./borga-responseCodes');
const errors = responseCodes.errorList;
const successes = responseCodes.successList;

module.exports = function(data_ext, data_int) {
	
	async function getUsername(token) {
		if(!token){
			throw errors.UNAUTHENTICATED('no token');
		}
		const username = await data_int.tokenToUsername(token);
		if(!username) {
			throw errors.UNAUTHENTICATED('invalid token');
		}
		return username;
	}

	async function searchGame(query) {
		if(!query) {
			throw errors.MISSING_PARAM('query');
		}
		try{
			const game = await data_ext.findGames(query);
			return game;
		} catch(err) {
			if(err.name === 'NOT_FOUND') {
				throw errors.INVALID_PARAM("Invalid game: " + query + " : " + err);
			}
			throw err;
		}
	}

	async function addGame(token, group, game) {
		if(!group) {
			throw errors.MISSING_PARAM('group');
		}
		if(!game) {
			throw errors.MISSING_PARAM('game');
		}
		try{
			const username = await getUsername(token);
			const gameObj = await data_ext.findGameById(game); 
			const gameRes = data_int.saveGame(username, group, gameObj);
			return gameRes;
		} catch (err) {
			if(err.name === 'NOT_FOUND') {
				throw errors.INVALID_PARAM("Invalid game: " + game + " : " + err);
			}
			throw err;
		}
	}
	
	async function deleteGame(token, group, game) {
		const username = await getUsername(token);
		if(!group) {
			throw errors.MISSING_PARAM('group');
		}
		if(!game) {
			throw errors.MISSING_PARAM('game');
		}
		const gameRes = data_int.deleteGame(username, group, game);
		return gameRes;
	}

	async function createGroup(token, groupName, groupDesc) {
		const username = await getUsername(token);
		if(!groupName) {
			throw errors.MISSING_PARAM('name');
		}
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

	async function editGroup(token, groupId, newGroupName, newGroupDesc) {
		const username = await getUsername(token);
		if(!groupId) {
			throw errors.MISSING_PARAM('id');
		}
		const group = await data_int.editGroup(username, groupId, newGroupName, newGroupDesc);
		return group;
	}

	async function getGroupInfo(token, groupId) {
		const username = await getUsername(token);
		if(!groupId) {
			throw errors.MISSING_PARAM('group');
		}
		const group = await data_int.getGroupInfo(username, groupId);
		return group;
	}

	async function deleteGroup(token, groupId) {
		const username = await getUsername(token);
		const group = await data_int.deleteGroup(
			username,
			groupId,
		)	
		return group;
	}

	async function getPopularGames() {
		try{
			return await data_ext.getPopularGames();
		} catch(err) {
			throw errors.FAIL('Unnable to retrieve most popular games list')
		}
	}

	return {
		getUsername,
		searchGame,
		addGame,
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
