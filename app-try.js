'use strict';

const data_ext = require('./board-games-data');
const data_int = require('./borga-data-mem');

const services =
	require('./borga-services')(data_ext, data_int);

async function tryDataExtFind() {
	const game = await data_ext.findGame(process.argv[2]);

	console.log(':: SUCCESS ::');
	console.log(game);	
}


async function tryDataExtGet() {
	const game = await data_ext.getGameById(process.argv[2]);

	console.log(':: SUCCESS ::');
	console.log(game);	
}


async function tryDataExtInt() {
	async function findAndSaveGame(query) {
		const game = await data_ext.findGame(query);
		return data_int.saveGame(game);
	}
	for (const query of process.argv.slice(2)) {
		await findAndSaveGame(query);
	}
	/*
	await Promise.all(
		process.argv.slice(2).map(findAndSavegame)
	);
	*/

	const games = await data_int.listGames();

	console.log(':: GAMES LIST ::');
	console.log(JSON.stringify(games, null, 2));
	
	for (const game of games) {
		await data_int.deleteGame(game.id);
		console.log(':: DELETED ::');
		console.log('ID:', game.id);	
	}

	const noGames = await data_int.listGames();

	console.log(':: FINAL GAMES LIST ::');
	console.log(JSON.stringify(noGames, null, 2));
}

async function tryServices() {
	async function findAndSaveGame(query) {
		const game = await services.searchGame(query);
		game.title = "X";
		game.batata = "_#$R";
		return services.addGame(game.id);
	}
	
	for (const query of process.argv.slice(2)) {
		await findAndSaveGame(query);
	}

	const games = await services.getAllGames();

	console.log(':: GAMES LIST ::');
	console.log(JSON.stringify(games, null, 2));
	
	for (const game of games) {
		await services.deleteGame(game.id);
		console.log(':: DELETED ::');
		console.log('ID:', game.id);	
	}

	const noGames = await services.getAllGames();

	console.log(':: FINAL GAMES LIST ::');
	console.log(JSON.stringify(noGames, null, 2));
}

async function main() {
	try {
		
		await tryDataExtFind();
		await tryDataExtGet();
		await tryDataExtInt();
		await tryServices();

	} catch (err) {
		console.log(':: FAILURE ::');
		console.log(err);
	}
}

main();
