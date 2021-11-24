'use strict';

const express = require('express');
const errors = require('./app-errors');

module.exports = function (services) {
	
	function onError(req, res, err) {
		switch (err.name) {
			case 'NOT_FOUND':
				res.status(404);
				break;
			case 'EXT_SVC_FAIL':
				res.status(502);
				break;
			default:
				res.status(500);
		}
		res.json(err);
	}

	async function searchInGlobalGames(req, res) {
		try {
			if (req.query.q == undefined) {
				console.log('Undefined query');
				const popular = await services.getPopularGames();
				res.json(popular);
			} else {
				console.log('Search game');
				const game = await services.searchGame(req.query.q);
				res.json(game);
			}
		} catch (err) {
			res.status(500).json(err);
		}
	}

	async function getMyGames(req, res) {
		try {
			const games = await services.getAllGames();
			res.json(games);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function addMyGameById(req, res) {
		try {
			const gameId = req.params.gameId;
			console.log(gameId);
			const gameIdRes = await services.addGame(gameId);
			res.json(gameIdRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function getMyGameById(req, res) {
		try {
			const gameId = req.params.gameId;
			const game = await services.getGame(gameId);
			res.json(game);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function deleteMyGameById(req, res) {
		try {
			const gameId = req.params.gameId;
			const gameIdRes = await services.deleteGame(gameId);
			res.json(gameIdRes);
		} catch (err) {
			onError(req, res, err);
		}
	}
	
	//middleware
	const router = express.Router();
	router.use(express.json());

	// Resource: /global/games
	router.get('/global/games', searchInGlobalGames);


	// Resource: /my/games
	router.get('/my/games/get', getMyGames);
	router.post('/my/games/add/:gameId', addMyGameById);

	// Resource: /my/games/<gameId>
	router.get('/my/games/get/:gameId', getMyGameById);
	router.delete('/my/games/delete/:gameId', deleteMyGameById);
	
	return router;
}
