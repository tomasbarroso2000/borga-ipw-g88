'use strict';

const errors = require('./app-errors');

const crypto = require('crypto');

const games = {}; // o stor não tem isto

const tokens = {
	'1365834658346586' : 'membroTeste'
}; //associa tokens a users      

//associa usernames aos seus reospetivos grupos
const users = {
	'exemplo1' : { games: {} }
}; 


function createUsers(username) {
	if (!users[username]) {
		const newToken = crypto.randomUUID();
		tokens[newToken] = username;
	} else {
		console.log("User already exists");
	}
}

const hasGame = async (username, gameId) => !!users[username].groups[gameId];

async function saveGame(username, gameObj) {
	const gameId = gameObj.id;
	users[username].groups[gameId] = gameObj;
	return gameId;
}

async function loadGame(username, gameId) {
	const gameObj = users[username].groups[gameId];
	if (!gameObj) {
		throw errors.NOT_FOUND({ id: gameId });
	}
	return gameObj;
}

async function deleteGame(username, gameId) {
	const gameObj = users[username].groups[gameId];
	if (!gameObj) {
		throw errors.NOT_FOUND({ id: gameId });
	}
	delete users[username].groups[gameId];
	return gameId;
}

const listGames = async (username) => Object.values(users[username].groups);

async function tokenToUsername(token){
	return tokens[token];
}

module.exports = {
	hasGame,
	saveGame,
	loadGame,
	deleteGame,
	listGames,
	tokenToUsername
};
