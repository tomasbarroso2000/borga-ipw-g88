'use strict';

const responseCodes = require('./borga-responseCodes');
const errors = responseCodes.errorList;
const successes = responseCodes.successList;
const crypto = require('crypto');

const games = {};

const tokens = {
	'fz3zMebxQXybYskc567j5w': 'guest'
};

const groups = {
	'guest': {
		'12345': {"id": "12345", "name": "grupo_teste", "description": "grupo para testes", "games": [] }
	}
}

const users = {
	'guest': {username: 'guest', password: '1234', token: 'fz3zMebxQXybYskc567j5w'}
}

const hasGame = async (gameId) => !!games[gameId];

//const hasGroup = async (user, groupId) => !!user[groupId];

const hasGroup = async (user, groupId) => !!groups[user][groupId];

/*const hasGameInGroup = async (user, groupId, gameId) => {
	return user[groupId].games.includes(gameId);
}*/
const hasGameInGroup = async (user, groupId, gameId) => groups[user][groupId].games.includes(gameId);

const tokenToUsername = async (token) => tokens[token];

const listGames = async (group) => {
	const gamesList = [];
	group.games.forEach(async elem => {
		const name = await games[elem].name;
		gamesList.push(name);
	});
	return gamesList;
}

function getGameInGlobal(gameId){
	return games[gameId];
}

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
	users[username] = {username: username, password: password, token: newToken};
	groups[username] = {};
	return successes.USER_ADDED("Username " + username + " added with token " + newToken);
}

async function getGroups(username) {
	return groups[username];
}

function createGroup(username, groupId, groupName, groupDesc) {
	groups[username][groupId] = {'id': groupId, 'name': groupName, 'description': groupDesc, 'games': [] };
	return successes.GROUP_CREATED('Group ' + groupName + ' created');
}

async function editGroup(username, groupId, newGroupName, newGroupDesc) {
	const userGroups = groups[username];
	const group = userGroups[groupId];
	const hasGroupInUser = await hasGroup(username, groupId);
	if (!hasGroupInUser) {
		throw errors.NOT_FOUND("Group doesn't exist");
	}
	group.description = newGroupDesc;
	group.name = newGroupName;
	return successes.GROUP_MODIFIED("Group Name: " + newGroupName + " | Group Description: " + newGroupDesc);
}

async function deleteGroup(username, groupId) {
	const userGroups = groups[username];
	const group = userGroups[groupId];
	const hasGroupInUser = await hasGroup(username, groupId);
	if (!hasGroupInUser) {
		throw errors.NOT_FOUND("Group doesn't exist");
	}
	const groupName = group.name;
	delete userGroups[groupId];
	return successes.GROUP_DELETED("Group " + groupName + " deleted");
}

async function getGroupInfo(username, groupId) {
	const userGroups = groups[username];
	const hasGroupInUser = await hasGroup(username, groupId);
	if (!hasGroupInUser) {
		throw errors.NOT_FOUND("Group doesn't exist");
	}
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
	const hasGroupInUser = await hasGroup(username, groupId);
	if (!hasGroupInUser) {
		throw errors.NOT_FOUND("Group doesn't exist");
	}
	const hasGameInUserGroup = await hasGameInGroup(username, groupId, gameId);
	if (!hasGameInUserGroup) {
		throw errors.NOT_FOUND("Game doesn't exist");
	}
	const games = userGroups[groupId].games;
	games.splice(games.indexOf(gameId), 1);
	return successes.GAME_REMOVED("Game removed from group " + userGroups[groupId].name);
}

function getUser(username){
	return users[username];
}

function listGameObjs(username, groupId){
	const gamesArray = [];
	const groupGames = groups[username][groupId].games;
	groupGames.forEach( elem => {
		gamesArray.push(games[elem])
	}); 
	return gamesArray;
}

module.exports = {
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
	hasGame
};
