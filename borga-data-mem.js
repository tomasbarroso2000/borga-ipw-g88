'use strict';

const errors = require('./app-errors');

const crypto = require('crypto');
const errorList = require('./app-errors');

const games = {};

const tokens = {
	'1365834658346586' : 'membroTeste'
}; //associa tokens a users      

/*
//associa usernames aos seus reospetivos grupos
const users = {
	'exemplo1' : { games: {} }
};
*/

const users = {
	'membroTeste' : { }
}

function createGroup(token, groupName, groupDesc){
	const username = tokens[token];
	const user = users[username];
	const group = user[groupName];
	if (user && !group) {
		user[groupName] = {'description' : groupDesc, 'games' : []};
	} else {
		console.log('Group already exists');
	}
	return user[groupName];
}

function deleteGroup(token, groupName){
	const username = tokens[token];
	const user = users[username];
	if(user && user[groupName]){
		delete user[groupName];
	}	
	return groupName;
}

function editGroup(token, oldGroupName, newGroupName, newGroupDesc) {
	const username = tokens[token];
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

function createUsers(username) {
	if (!users[username]) {
		const newToken = crypto.randomUUID();
		tokens[newToken] = username;
	} else {
		console.log("User already exists");
	}
}

const hasGame = async (gameId) => games[gameId] != undefined;

const hasGroup = async (username, groupName) => users[username][groupName] != undefined;


const hasGameInGroup = async (username, groupName, gameId) => users[username][groupName].games.any((elem) => {
	return elem == gameId;
});


async function saveGame(username, groupName, gameObj) {
	const gameId = gameObj.id;
	if (hasGroup(username, groupName) & !hasGameInGroup(username, groupName, gameId)){
		users[username][groupName].push(gameId);
		if (!hasGame(gameId))
			games[gameId] = gameObj;
	}
	return gameId;
}

async function loadGame(username, groupName, gameId) {
	const gameObj = games[gameId]
	if (!hasGameInGroup(username, groupName, gameId)) {
		throw errors.NOT_FOUND({ id: gameId });
	}
	return gameObj;
}

async function deleteGame(username, groupName, gameId) {
	if (!hasGameInGroup(username, groupName, gameId)) {
		throw errors.NOT_FOUND({ id: gameId });
	}
	delete users[username][groupName][gameId];
	return gameId;
}

const listGames = async (username, groupName) => {
	const gameObjs = [];
	users[username][groupName].array.forEach(element => {
		gameObjs.push(games[element]);
	});
	return gameObjs
}

async function tokenToUsername(token){
	return tokens[token];
}

async function getGroups(token) {
	const username = tokens[token];
	const groups = users[username];
	console.log(groups);
	if (groups) {
		return groups;
	} else {
		throw errorList.NOT_FOUND("Group doesn't exist");
	}
}

module.exports = {
	hasGame: hasGameInGroup,
	saveGame,
	loadGame,
	deleteGame,
	listGames,
	tokenToUsername,
	createGroup,
	getGroups,
	editGroup,
	deleteGroup
};
