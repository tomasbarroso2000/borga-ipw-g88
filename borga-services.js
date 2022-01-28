'use strict';

const responseCodes = require('./borga-responseCodes');
const errors = responseCodes.errorList;

module.exports = function (data_ext, data_int) {

	async function getUsername(token) {
		const username = await data_int.tokenToUsername(token);
		if (!username) {
			throw errors.UNAUTHENTICATED('invalid token');
		}
		return username;
	}

	async function checkAndGetUser(username, password) {
		if (!username || !password) {
			throw errors.MISSING_PARAM('missing credentials');
		}
		const user = await data_int.getUser(username);
		if (user.password !== password) {
			throw errors.UNAUTHENTICATED(username);
		}
		return user;
	}

	async function createUser(username, password) {
		if (!username) {
			throw errors.MISSING_PARAM('username');
		}
		if (!password) {
			throw errors.MISSING_PARAM('password');
		}
		if (await data_int.isUsernameTaken(username)) {
			throw errors.INVALID_PARAM("Username " + username + " already exists");
		}
		const user = await data_int.createUser(username, password);
		return user;
	}

	async function getPopularGames() {
		try {
			return await data_ext.getPopularGames();
		} catch (err) {
			throw errors.EXT_SVC_FAIL('Board Game Atlas is not responding');
		}
	}

	async function searchGame(query) {
		if (!query) {
			throw errors.MISSING_PARAM('query');
		}
		try {
			const game = await data_ext.findGames(query);
			return game;
		} catch (err) {
			if (err.name === 'NOT_FOUND') {
				throw errors.INVALID_PARAM("Invalid game: " + query + " : " + err);
			}
			if (err.name = 'EXT_SVC_FAIL') {
				throw errors.EXT_SVC_FAIL('Board Game Atlas is not responding');
			}
			throw err;
		}
	}

	async function getGameInfo(gameId) {
		if (!gameId) {
			throw errors.MISSING_PARAM('gameId');
		}

		let game = await data_int.getGameInGlobal(gameId);
		if (! await data_int.hasGame(game)) {
			game = await data_ext.findGameById(gameId);
		}

		const newMechanics = await data_ext.getMechanics(game.mechanics);
		const newCategories = await data_ext.getCategories(game.categories);
		game.mechanics = newMechanics;
		game.categories = newCategories;
		return game;
	}

	async function getGroups(token) {
		if (!token) {
			throw errors.UNAUTHENTICATED();
		}
		const username = await getUsername(token);
		const group = await data_int.getGroups(
			username
		)
		return group;
	}

	function makeGroupId() {
		const length = 8;
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	async function createGroup(token, groupName, groupDesc) {
		const username = await getUsername(token);

		let groupId = makeGroupId();
		while (await data_int.hasGroup(username, groupId)) {
			groupId = makeGroupId();
		}
		if (!groupName) {
			throw errors.MISSING_PARAM('name');
		}
		const group = await data_int.createGroup(
			username,
			groupId,
			groupName,
			groupDesc
		)
		return group;
	}

	async function editGroup(token, groupId, newGroupName, newGroupDesc) {
		const username = await getUsername(token);
		if (!groupId) {
			throw errors.MISSING_PARAM('id');
		}
		if (! await data_int.hasGroup(username, groupId)) {
			throw errors.NOT_FOUND("Group doesn't exist");
		}
		const group = await data_int.editGroup(username, groupId, newGroupName, newGroupDesc);
		return group;
	}

	async function deleteGroup(token, groupId) {
		const username = await getUsername(token);
		if (!groupId) {
			throw errors.MISSING_PARAM('groupId');
		}

		if (! await data_int.hasGroup(username, groupId)) {
			throw errors.NOT_FOUND('This group does not exist');
		}

		const group = await data_int.deleteGroup(
			username,
			groupId,
		)
		return group;
	}

	async function getGroupInfo(token, groupId) {
		const username = await getUsername(token);
		if (!groupId) {
			throw errors.MISSING_PARAM('group');
		}

		if (! await data_int.hasGroup(username, groupId)) {
			throw errors.NOT_FOUND("Group doesn't exist");
		}

		const group = await data_int.getGroupInfo(username, groupId);
		return group;
	}

	async function addGame(token, group, game) {
		if (!group) {
			throw errors.MISSING_PARAM('group');
		}
		if (!game) {
			throw errors.MISSING_PARAM('game');
		}

		const username = await getUsername(token);
		if (! await data_int.hasGroup(username, group)) {
			throw errors.NOT_FOUND("Group does not exist");
		}

		if (await data_int.hasGameInGroup(username, group, game))
			throw errors.INVALID_PARAM("Game already exists in group");

		try {
			let gameObj = await data_int.getGameInGlobal(game);
			if (! await data_int.hasGame(game)) {
				gameObj = await data_ext.findGameById(game);
			}
			const gameRes = await data_int.saveGame(username, group, gameObj);
			return gameRes;
		} catch (err) {
			if (err.name === 'NOT_FOUND') {
				throw errors.INVALID_PARAM("Invalid game: " + game + " : " + err);
			}
			if (err.name = 'EXT_SVC_FAIL') {
				throw errors.EXT_SVC_FAIL('Board Game Atlas is not responding');
			}
			throw err;
		}
	}

	async function deleteGame(token, group, game) {
		const username = await getUsername(token);
		if (!group) {
			throw errors.MISSING_PARAM('group');
		}
		if (!game) {
			throw errors.MISSING_PARAM('game');
		}

		if (! await data_int.hasGroup(username, group))
			throw errors.NOT_FOUND("Group does not exist");
		if (! await data_int.hasGameInGroup(username, group, game))
			throw errors.NOT_FOUND("Game does not exist in group");
		if (! await data_int.hasGame(game))
			throw errors.NOT_FOUND("Game does not exist");

		const gameRes = data_int.deleteGame(username, group, game);
		return gameRes;
	}

	async function listGameObjs(token, group) {
		const username = await getUsername(token);
		if (!group) {
			throw errors.MISSING_PARAM('group');
		}
		const groupRes = data_int.listGameObjs(username, group);
		return groupRes;
	}

	return {
		getUsername,
		checkAndGetUser,
		searchGame,
		addGame,
		deleteGame,
		getPopularGames,
		createGroup,
		getGroups,
		editGroup,
		deleteGroup,
		getGroupInfo,
		createUser,
		listGameObjs,
		getGameInfo
	};
};
