'use strict';

const responseCodes = require('./borga-responseCodes');
const errors = responseCodes.errorList;
const successes = responseCodes.successList;
const crypto = require('crypto');

const games = {};

const tokens = {
	'1365834658346586': 'membroTeste'
};

const users = {
	'membroTeste': {
		'12345': { "name": "grupo_teste", "description": "grupo para testes", "games": [] }
	}
}

const hasGame = async (gameId) => !!games[gameId];

const hasGroup = async (user, groupId) => !!user[groupId];

const hasGameInGroup = async (user, groupId, gameId) => {
	return user[groupId].games.includes(gameId);
}

const tokenToUsername = async (token) => tokens[token];

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

function createGroup(username, groupName, groupDesc) {
	let groupId = makeGroupId();
	const user = users[username];
	while (user[groupId]) {
		groupId = makeGroupId();
	}
	user[groupId] = { 'name': groupName, 'description': groupDesc, 'games': [] };
	return successes.GROUP_CREATED('Group ' + groupName + ' created');
}

async function deleteGroup(username, groupId) {
	const user = users[username];
	const group = user[groupId];
	const hasGroupInUser = await hasGroup(user, groupId);
	if (!hasGroupInUser) {
		throw errors.FAIL("Group doesn't exist");
	}
	const groupName = group.name;
	delete user[groupId];
	return successes.GROUP_DELETED("Group " + groupName + " deleted");
}

async function editGroup(username, groupId, newGroupName, newGroupDesc) {
	const user = users[username];
	const group = user[groupId];
	const hasGroupInUser = await hasGroup(user, groupId);
	if (!hasGroupInUser) {
		throw errors.FAIL("Group doesn't exist");
	}
	group.description = newGroupDesc;
	group.name = newGroupName;
	return successes.GROUP_MODIFIED("Group Name: " + newGroupName + " | Group Description: " + newGroupDesc);
}

function createUser(username) {
	if (!username) {
		throw errors.MISSING_PARAM("Unspecified username");
	}
	const user = users[username];
	if (user) {
		throw errors.FAIL("Username " + username + " already exists");
	}
	const newToken = crypto.randomUUID();
	tokens[newToken] = username;
	users[username] = {};
	return successes.USER_ADDED("Username " + username + " added with token " + newToken);
}

async function saveGame(username, groupId, gameObj) {
	const user = users[username];
	const group = user[groupId];
	const gameId = gameObj.id;
	const hasGroupInUser = await hasGroup(user, groupId);
	if (!hasGroupInUser) {
		throw errors.FAIL("Group doesn't exist");
	}
	const hasGameInUserGroup = await hasGameInGroup(user, groupId, gameId);
	if (hasGameInUserGroup) {
		throw errors.FAIL("Game " + gameObj.name + " is already in " + group.name);
	}
	const hasGameInGlobal = await hasGame(gameId);
	if (!hasGameInGlobal) {
		games[gameId] = gameObj;
	}
	user[groupId].games.push(gameId);
	return successes.GAME_ADDED(gameObj.name + " added to group " + group.name);
}

async function deleteGame(username, groupId, gameId) {
	const user = users[username];
	const hasGroupInUser = await hasGroup(user, groupId);
	if (!hasGroupInUser) {
		throw errors.FAIL("Group doesn't exist");
	}
	const hasGameInUserGroup = await hasGameInGroup(user, groupId, gameId);
	if (!hasGameInUserGroup) {
		throw errors.FAIL("Game doesn't exist");
	}
	const games = user[groupId].games;
	games.splice(games.indexOf(gameId), 1);
	return successes.GAME_REMOVED("Game removed from group " + user[groupId].name);
}

const listGames = async (group) => {
	const gamesList = [];
	group.games.forEach(async elem => {
		const name = await games[elem].name;
		gamesList.push(name);
	});
	return gamesList;
}

async function getGroups(username) {
	const groups = users[username];
	if (!groups) {
		throw errors.NOT_FOUND("Group doesn't exist");
	}
	return groups;
}

async function getGroupInfo(username, groupId) {
	const user = users[username];
	const hasGroupInUser = await hasGroup(user, groupId);
	if (!hasGroupInUser) {
		throw errors.FAIL("Group doesn't exist");
	}
	const group = user[groupId];
	const groupObj = {
		name: group.name,
		description: group.description,
		games: await listGames(group)
	};
	return groupObj;
}

module.exports = {
	saveGame,
	deleteGame,
	tokenToUsername,
	createUser,
	createGroup,
	getGroups,
	editGroup,
	deleteGroup,
	getGroupInfo
};
