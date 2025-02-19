'use strict';

const responseCodes = require('./borga-responseCodes');
const errors = responseCodes.errorList;
const successes = responseCodes.successList;
const crypto = require('crypto');

module.exports = function (guest) {

	const games = {};

	const tokens = {
		[guest.token] : guest.username,
		'1365834658346586' : 'membroTeste'
	};

	const groups = {
		[guest.username]: {
			'12345': { "id": "12345", "name": "grupo_teste", "description": "grupo para testes", "games": [] }
		},
		'membroTeste': {
			'12345': { "id": "12345", "name": "grupo_teste", "description": "grupo para testes", "games": [] }
		}
	}

	const users = {
		[guest.username]: { username: guest.username, password: guest.password, token: guest.token }
	}

	const hasGame = async (gameId) => !!games[gameId];

	const hasGroup = async (user, groupId) => !!groups[user][groupId];

	const hasGameInGroup = async (user, groupId, gameId) => groups[user][groupId].games.includes(gameId);

	const tokenToUsername = async (token) => {
		const username = tokens[token];
		return username;
	}

	const listGames = async (group) => {
		const gamesList = [];
		group.games.forEach(async elem => {
			const name = await games[elem].name;
			gamesList.push(name);
		});
		return gamesList;
	}

	const getGameInGlobal = async (gameId) => games[gameId];

	const isUsernameTaken = async (username) => !!users[username];

	function createUser(username, password) {
		if (!username) {
			throw errors.MISSING_PARAM("Unspecified username");
		}
		const user = groups[username];
		if (user) {
			throw errors.INVALID_PARAM("Username " + username + " already exists");
		}
		const newToken = crypto.randomUUID();
		tokens[newToken] = username;
		users[username] = { username: username, password: password, token: newToken };
		groups[username] = {};
		return successes.USER_ADDED("Username " + username + " added with token " + newToken);
	}

	async function getGroups(username) {
		return groups[username];
	}

	function createGroup(username, groupId, groupName, groupDesc) {
		groups[username][groupId] = { 'id': groupId, 'name': groupName, 'description': groupDesc, 'games': [] };
		return successes.GROUP_CREATED('Group ' + groupName + ' created');
	}

	async function editGroup(username, groupId, newGroupName, newGroupDesc) {
		const userGroups = groups[username];
		const group = userGroups[groupId];
		if (newGroupDesc) {
			group.description = newGroupDesc;
		}
		if (newGroupName) {
			group.name = newGroupName;
		}
		return successes.GROUP_MODIFIED("Group Name: " + group.name + " | Group Description: " + group.description);
	}

	async function deleteGroup(username, groupId) {
		const userGroups = groups[username];
		const group = userGroups[groupId];
		const groupName = group.name;
		delete userGroups[groupId];
		return successes.GROUP_DELETED("Group " + groupName + " deleted");
	}

	async function getGroupInfo(username, groupId) {
		const userGroups = groups[username];
		const group = userGroups[groupId];
		const groupObj = {
			id: groupId,
			name: group.name,
			description: group.description,
			games: listGameObjs(username, groupId)
		};
		return groupObj;
	}

	async function saveGame(username, groupId, gameObj) {
		const userGroups = groups[username];
		const group = userGroups[groupId];
		const gameId = gameObj.id;
		const hasGameInGlobal = await hasGame(gameId);
		if (!hasGameInGlobal) {
			games[gameId] = gameObj;
		}
		userGroups[groupId].games.push(gameId);
		return successes.GAME_ADDED(gameObj.name + " added to group " + group.name);
	}

	async function deleteGame(username, groupId, gameId) {
		const userGroups = groups[username];
		const games = userGroups[groupId].games;
		games.splice(games.indexOf(gameId), 1);
		return successes.GAME_REMOVED("Game removed from group " + userGroups[groupId].name);
	}

	function getUser(username) {
		return users[username];
	}

	function listGameObjs(username, groupId) {
		const gamesArray = [];
		const groupGames = groups[username][groupId].games;
		groupGames.forEach(elem => {
			gamesArray.push(games[elem])
		});
		return gamesArray;
	}

	return {
		saveGame,
		deleteGame,
		deleteGroup,
		createGroup,
		editGroup,
		getGroups,
		getGroupInfo,
		getUser,
		createUser,
		tokenToUsername,
		listGameObjs,
		hasGroup,
		hasGameInGroup,
		getGameInGlobal,
		hasGame,
		isUsernameTaken
	}
}
