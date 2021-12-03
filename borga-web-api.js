'use strict';

const express = require('express');

const errors = require('./borga-errors');

const openApiUi = require('swagger-ui-express');
const openApiSpec = require('./docs/borga-api-spec.json');
//const { createGroup } = require('./borga-data-mem');

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
				const popular = await services.getPopularGames();
				res.json(popular);
			} else {
				const game = await services.searchGame(req.query.search);
				res.json(game);
			}
		} catch (err) {
			res.status(500).json(err);
		}
	}

	async function addGameToGroup(req, res) {
		try {
			const groupName = req.body.group;
			const game = req.body.game;
			const token = getBearerToken(req);
			const gameRes = await services.addGame(token, groupName, game);
			res.json(gameRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function deleteGameFromGroup(req, res) {
		try {
			const groupName = req.body.group;
			const game = req.body.game;
			const token = getBearerToken(req);
			const gameRes = await services.deleteGame(token, groupName, game);
			res.json(gameRes);
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
			const oldGroupName = req.body.id;
			const newGroupName = req.body.name;
			const newGroupDesc = req.body.description;
			const token = getBearerToken(req);
			const groupRes = await services.editGroup(token, oldGroupName, newGroupName, newGroupDesc);
			return res.json(groupRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function deleteGroup(req, res) {
		try{
			const groupName = req.body.id;
			const token = getBearerToken(req);
			const groupRes = await services.deleteGroup(token, groupName)
			return res.json(groupRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function getGroupInfo(req, res) {
		try{
			const groupName = req.body.group;
			const token = getBearerToken(req);
			const groupRes = await services.getGroupInfo(token, groupName)
			return res.json(groupRes);
		} catch (err) {
			onError(req, res, err);
		}
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

	//middleware
	const router = express.Router();

	router.use('/docs', openApiUi.serve);
	router.get('/docs', openApiUi.setup(openApiSpec));

	router.use(express.json());

	//Resource: /users
	router.post('/users/create', createUser);
	
	//Resource: /global/games
	router.get('/global/games', searchInGlobalGames);

	//Resource: /my/groups
	router.get('/my/groups/info', getGroupInfo);
	router.delete('/my/groups/games/delete', deleteGameFromGroup);
	router.post('/my/groups/games/add', addGameToGroup);
	router.post('/my/groups/create', createGroup);
	router.get('/my/groups/get', getGroups);
	router.put('/my/groups/edit', editGroup);
	router.delete('/my/groups/delete', deleteGroup); 
	
	return router;
}
