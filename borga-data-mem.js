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
	console.log(user[groupName].games.includes(gameId));
	return user[groupName].games.includes(gameId);
}

/*
async function tokenToUsername(token){
	return tokens[token];
}
*/

const tokenToUsername = async (token) => tokens[token];

/*function createGroup(username, groupName, groupDesc){
	const user = users[username];
	const group = user[groupName];
	if (user && !group) {
		user[groupName] = {'description' : groupDesc, 'games' : []};
	} else {
		console.log('Group already exists');
	}
	return user[groupName];
}*/

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
	} else {
		console.log("User already exists");
	}
}

async function saveGame(username, groupName, gameObj) {
	const gameId = gameObj.id;
	const user = users[username];
	user[groupName].games.push(gameId);
	const has = await hasGame(gameId)
	if (!has) {
		games[gameId] = gameObj;
	}
	console.log(JSON.stringify(games));
	return gameId;
}

async function deleteGame(username, groupName, gameObj) {
	const gameId = gameObj.id;
	const user = users[username];
	const games = user[groupName].games
	games.splice(games.indexOf(gameId), 1);
	return gameId;
}

const listGames = async (username, groupName) => {
	const gameObjs = [];
	users[username][groupName].array.forEach(element => {
		gameObjs.push(games[element]);
	});
	return gameObjs
}

async function getGroups(username) {
	const groups = users[username];
	console.log(groups);
	if (groups) {
		return groups;
	} else {
		throw errorList.NOT_FOUND("Group doesn't exist");
	}
}

async function getGroupInfo(username, groupName) {
	const group = users[username][groupName];
	const groupObj = {};
	groupObj.name = groupName;
	groupObj.description = group.description;
	const gamesList = [];
	group.games.forEach(async elem => {
		console.log(elem);
		const name = await games[elem].name;
		console.log(name);
		gamesList.push(name);
	});
	groupObj.games = gamesList;
	return groupObj;
}

module.exports = {
	hasGame: hasGameInGroup,
	hasGroup,
	saveGame,
	deleteGame,
	listGames,
	tokenToUsername,
	createGroup,
	getGroups,
	editGroup,
	deleteGroup,
	getGroupInfo
};
