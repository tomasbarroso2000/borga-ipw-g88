'use strict';

const express = require('express');

const openApiUi = require('swagger-ui-express');
const openApiSpec = require('./docs/borga-api-spec.json');

module.exports = function (services) {

	function getBearerToken(req) {
		const auth = req.header('Authorization');
		if (auth) {
			const authData = auth.trim();
			if (authData.substr(0, 6).toLowerCase() === 'bearer') {
				return authData.replace(/^bearer\s+/i, '');
			}
		}
		return null;
	}

	function onError(req, res, err) {
		console.log('[ERROR]', err);
		switch (err.name) {
			case 'NOT_FOUND':
				res.status(404);
				break;
			case 'EXT_SVC_FAIL':
				res.status(502);
				break;
			case 'MISSING_PARAM':
			case 'INVALID_PARAM':
				res.status(400);
				break;
			case 'UNAUTHENTICATED':
				res.status(401);
				break;
			default:
				res.status(500);
		}
		res.json({ cause: err });
	}

	async function createUser(req, res) {
		try {
			const username = req.body.username;
			const userRes = await services.createUser(username);
			return res.json(userRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function searchInGlobalGames(req, res) {
		try {
			if (req.query.search == undefined) {
				const popular = await services.getPopularGames();
				res.json(popular);
			} else {
				const game = await services.searchGame(req.query.search);
				res.json(game);
			}
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function getGroups(req, res) {
		try {
			const token = getBearerToken(req);
			const groupRes = await services.getGroups(token);
			return res.json(groupRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function createGroup(req, res) {
		try {
			const groupName = req.body.name;
			const groupDesc = req.body.description;
			const token = getBearerToken(req);
			const groupRes = await services.createGroup(token, groupName, groupDesc);
			res.json(groupRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function editGroup(req, res) {
		try {
			const groupId = req.body.id;
			const newGroupName = req.body.name;
			const newGroupDesc = req.body.description;
			const token = getBearerToken(req);
			const groupRes = await services.editGroup(token, groupId, newGroupName, newGroupDesc);
			return res.json(groupRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function deleteGroup(req, res) {
		try {
			const groupId = req.params.groupId;
			const token = getBearerToken(req);
			const groupRes = await services.deleteGroup(token, groupId)
			res.json(groupRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function getGroupInfo(req, res) {
		try {
			const groupId = req.params.groupId;
			const token = getBearerToken(req);
			const groupRes = await services.getGroupInfo(token, groupId)
			return res.json(groupRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function addGameToGroup(req, res) {
		try {
			const groupId = req.params.groupId;
			const game = req.params.gameId;
			const token = getBearerToken(req);
			const gameRes = await services.addGame(token, groupId, game);
			res.json(gameRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function deleteGameFromGroup(req, res) {
		try {
			const groupId = req.params.groupId;
			const game = req.params.gameId;
			const token = getBearerToken(req);
			const gameRes = await services.deleteGame(token, groupId, game);
			res.json(gameRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function getGameInfo(req, res) {
		try {
			const gameId = req.params.gameId;
			const gameRes = await services.getGameInfo(gameId);
			res.json(gameRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	//middleware
	const router = express.Router();

	router.use('/docs', openApiUi.serve);
	router.get('/docs', openApiUi.setup(openApiSpec));

	router.use(express.json());

	//Resource: /users
	router.post('/users/new', createUser);

	//Resource: /global/games
	router.get('/global/games', searchInGlobalGames);
	router.get('/global/games/:gameId', getGameInfo);

	//Resource: /my/groups
	router.get('/my/groups', getGroups);
	router.post('/my/groups', createGroup);
	router.put('/my/groups', editGroup);
	router.delete('/my/groups/:groupId', deleteGroup);
	router.get('/my/groups/:groupId/info', getGroupInfo);

	router.post('/my/groups/:groupId/:gameId', addGameToGroup);
	router.delete('/my/groups/:groupId/:gameId', deleteGameFromGroup);

	return router;
}
