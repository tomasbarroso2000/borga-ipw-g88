'use strict';

const express = require('express');

const errors = require('./app-errors');

const openApiUi = require('swagger-ui-express');
const openApiSpec = require('./docs/borga-api-spec.json');
const { createGroup } = require('./borga-data-mem');

module.exports = function (services) {

	function getBearerToken(req) {
		const auth = req.header('Authorization');
		if (auth) {
			const authData = auth.trim();
			if (authData.substr(0,6).toLowerCase() === 'bearer') {
				return authData.replace(/^bearer\s+/i, '');
			}
		}
		return null;
	}
	
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
			if (req.query.search == undefined) {
				console.log('Undefined query');
				const popular = await services.getPopularGames();
				res.json(popular);
			} else {
				console.log('Search game');
				const game = await services.searchGame(req.query.search);
				res.json(game);
			}
		} catch (err) {
			res.status(500).json(err);
		}
	}

	async function getMyGames(req, res) {
		try {
			const games = await services.getAllGames(getBearerToken(req));
			res.json(games);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function addMyGameById(req, res) {
		try {
			const gameId = req.body.gameId;
			console.log(gameId);
			const gameIdRes = await services.addGame(
				getBearerToken(req),
				gameId
			);
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

	async function createGroup(req, res) {
		try {
			const groupName = req.body.group;
			const groupDesc = req.body.desc;
			const token = getBearerToken(req);
			const groupRes = await services.addGroup(token, groupName, groupDesc);
			res.json(groupRes);
		} catch (err){
			onError(req, res, err);
		}
	}

	async function getGroups(req, res) {
		try {
			const token = getBearerToken(req);
			const groupRes = await services.getGroups(token);
			return res.json(groupRes);
		} catch (err){
			onError(req, res, err);
		}
	}

	async function editGroup(req, res) {
		try {
			const oldGroupName = req.body.old;
			const newGroupName = req.body.new;
			const newGroupDesc = req.body.desc;
			const token = getBearerToken(req);
			const groupRes = await services.editGroup(token, oldGroupName, newGroupName, newGroupDesc);
			return res.json(groupRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	//middleware
	const router = express.Router();

	router.use('/docs', openApiUi.serve);
	router.get('/docs', openApiUi.setup(openApiSpec));

	router.use(express.json());

	
	// Resource: /global/games
	router.get('/global/games', searchInGlobalGames);

/*
	// Resource: /my/games
	router.get('/my/games/get', getMyGames);
	router.post('/my/games/add', addMyGameById);

	// Resource: /my/games/<gameId>
	router.get('/my/games/get/:gameId', getMyGameById);
	router.delete('/my/games/delete/:gameId', deleteMyGameById);*/

	//Resource: /my/groups/
	router.post('/my/groups/create', createGroup);
	
	router.get('/my/groups/get', getGroups);

	//router.post('/my/groups/add', addGameToGroup); //falta implementar
	router.put('/my/groups/edit', editGroup);
	//router.delete('/my/groups/delete', deleteGameInGroup); //falta implementar
	
	return router;
}
