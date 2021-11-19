'use strict';

const express = require('express');

const errors = require('./app-errors');

module.exports = function (services) {
	
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
			const gameId = req.body.gameId;
			const gameIdRes = await services.addBook(gameId);
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
			const gameIdRes = await services.delGame(gameId);
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
	router.get('/my/games', getMyGames);
	router.post('/my/games', addMyGameById);

	// Resource: /my/games/<gameId>
	router.get('/my/games/:gameId', getMyGameById);
	router.delete('/my/games/:gameId', deleteMyGameById);


	
	return router;
}
