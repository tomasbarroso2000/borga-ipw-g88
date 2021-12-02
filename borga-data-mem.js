'use strict';

const errors = require('./borga-errors');
const crypto = require('crypto');
const errorList = require('./borga-errors');
const successes = require('./borga-successes')

const games = {};	//gameId: gameObj

const tokens = {
	'1365834658346586' : 'membroTeste'
};    

const users = {
	'membroTeste' : { }
}

//const hasGame = async (gameId) => games[gameId] != undefined;
const hasGame = async (gameId) => !!games[gameId];

//const hasGroup = async (username, groupName) => users[username][groupName] != undefined;
const hasGroup = async (username, groupName) => !!users[username][groupName];

const hasGameInGroup = async (username, groupName, gameId) => {
	const user = users[username];
	return user[groupName].games.includes(gameId);
}

/*
async function tokenToUsername(token){
	return tokens[token];
}
*/

const tokenToUsername = async (token) => tokens[token];

function createGroup(username, groupName, groupDesc){
	const user = users[username];
	const group = user[groupName];
	if (group) {
		throw errors.FAIL('Group ' + groupName + ' already exists!');
	}
	user[groupName] = {'description' : groupDesc, 'games' : []};
	return successes.GROUP_CREATED('Group ' + groupName + ' created!');
}

function deleteGroup(username, groupName){
	const user = users[username];
	if(user && user[groupName]){
		delete user[groupName];
	}	
	return groupName;
}

function editGroup(username, oldGroupName, newGroupName, newGroupDesc) {
	const user = users[username];
	const group = user[oldGroupName];
	delete user[oldGroupName];
	if (user && group) {
		if (newGroupDesc) {
			group.description = newGroupDesc;
		}
		if (newGroupName) {
			user[newGroupName] = group
		} else user[oldGroupName] = group
	}
	return group
}

function createUser(username) {
	if (!users[username]) {
		const newToken = crypto.randomUUID();
		tokens[newToken] = username;
		users[username] = {};
		return {token: newToken, username: username};
	} else {
		console.log("User already exists");
	}
}

async function saveGame(username, groupName, gameObj) {
	const gameId = gameObj.id;
	const user = users[username];
	user[groupName].games.push(gameId);
	const has = await hasGame(gameId);
	if (!has) {
		games[gameId] = gameObj;
	}
	return gameId;
}

async function deleteGame(username, groupName, gameObj) {
	const gameId = gameObj.id;
	const user = users[username];
	const games = user[groupName].games
	games.splice(games.indexOf(gameId), 1);
	return gameId;
}

const listGames = async (group) => {
	const gamesList = [];
	group.games.forEach(async elem => {
		const name = await games[elem].name;
		gamesList.push(name);
	});
	return gamesList
}

async function getGroups(username) {
	const groups = users[username];
	if (groups) {
		return groups;
	} else {
		throw errorList.NOT_FOUND("Group doesn't exist");
	}
}

async function getGroupInfo(username, groupName) {
	const group = users[username][groupName];
	const groupObj = {
		name: groupName,
		description: group.description,
		games: await listGames(group)
	};
	return groupObj;
}

module.exports = {
	hasGameInGroup,
	hasGroup,
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
