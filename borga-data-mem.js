'use strict';

const errors = require('./app-errors');

const games = {};

const hasGame = async (gameId) => !!games[gameId];

async function saveGame(gameObj) {
	const gameId = gameObj.id;
	games[gameId] = gameObj;
	console.log(games);
	return gameId;
}

async function loadGame(gameId) {
	const gameObj = games[gameId];
	if (!gameObj) {
		throw errors.NOT_FOUND({ id: gameId });
	}
	return gameObj;
}

async function deleteGame(gameId) {
	const gameObj = games[gameId];
	if (!gameObj) {
		throw errors.NOT_FOUND({ id: gameId });
	}
	delete games[gameId];
	return gameId;
}

const listGames = async () => Object.values(games);

module.exports = {
	hasGame,
	saveGame,
	loadGame,
	deleteGame,
	listGames
};
