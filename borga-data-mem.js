'use strict';

const errors = require('./app-errors');

const crypto = require('crypto');

const games = {};

const tokens = {}; //associa tokens a users 

const users = {username: groups}; //associa usernames aos seus reo«petivos grupos

function createUsers(username) {
	if (!users.username) {
		const newToken = crypto.randomUUID();
		tokens[newToken] = username;
	} else {
		console.log("User already exists");
	}
}

const hasGame = async (username, gameId) => !!games[gameId];

async function saveGame(username, gameObj) {
	const gameId = gameObj.id;
	groups[gameId] = gameObj;
	console.log(games);
	return gameId;
}

async function loadGame(username, gameId) {
	const gameObj = games[gameId];
	if (!gameObj) {
		throw errors.NOT_FOUND({ id: gameId });
	}
	return gameObj;
}

async function deleteGame(username, gameId) {
	const gameObj = games[gameId];
	if (!gameObj) {
		throw errors.NOT_FOUND({ id: gameId });
	}
	delete games[gameId];
	return gameId;
}

const listGames = async (username) => Object.values(games);

module.exports = {
	hasGame,
	saveGame,
	loadGame,
	deleteGame,
	listGames
};
