'use strict';

const express = require('express');
const path = require('path');

module.exports = function (services, guest_token) {

	function getToken(req) {
		return guest_token; // to be improved...
	}

    /*function getGroupId(req) {
        return req.body.groupId;
    }*/
	
	async function getHomepage(req, res) {
        const games = await services.getPopularGames();
		res.render('home', {games});
	} 

	function getSearchPage(req, res) {
		res.render('search');
	} 

    async function searchInGlobalGames(req, res) {
		const header = 'Find Game Result';
		const query = req.query.search;
		try {
            let games;
			if (query == undefined || query == "") {
				games = await services.getPopularGames();
			} else {
				games = await services.searchGame(query);
			}
            res.render(
                'games',
                { header, query, games, allowSave: true }
            );
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'games',
						{ header, query, error: 'no game found for this query' }
					);
					break;
				default:
					res.status(500).render(
						'games',
						{ header, query, error: JSON.stringify(err) }
					);
					break;
			}
		}
	}

	
	async function addGameToGroup(req, res) {
        const header = 'Save Game Result';
        const groupId = req.params.groupId;
		const game = req.params.gameId;
		const token = getToken();
		try {
			await services.addGame(token, groupId, game);
			res.redirect('/group/select');

		} catch (err) {
			onError(req, res, err);
		}
	}

	async function deleteGameFromGroup(req, res) {
		try {
			const groupId = req.params.groupId;
			const game = req.params.gameId;
			const token = getToken(req);
			const gameRes = await services.deleteGame(token, groupId, game);
			res.json(gameRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function createGroup(req, res) {
		try {
			const groupName = req.body.name;
			const groupDesc = req.body.description;
			const token = getToken(req);
			const groupRes = await services.createGroup(token, groupName, groupDesc);
			res.json(groupRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function getGroups(req, res) {
		const header = "My Groups"
		try {
			const token = getToken(req);
			const groupRes = await services.getGroups(token);
			res.render(
                'groups',
                { header, groupRes }
            );
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'groups',
						{ header, error:'no groups found' }
					);
					break;
				default:
					res.status(500).render(
						'groups',
						{ header, error: JSON.stringify(err) }
					);
					break;
			}
		}
	}

	async function editGroup(req, res) {
		try {
			const oldGroupName = req.body.id;
			const newGroupName = req.body.name;
			const newGroupDesc = req.body.description;
			const token = getToken(req);
			const groupRes = await services.editGroup(token, oldGroupName, newGroupName, newGroupDesc);
			return res.json(groupRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function deleteGroup(req, res) {
		try {
			const groupId = req.params.groupId;
			const token = getToken(req);
			const groupRes = await services.deleteGroup(token, groupId)
			res.json(groupRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function getGroupInfo(req, res) {
		try {
			const groupId = req.params.groupId;
			const token = getToken(req);
			const groupRes = await services.getGroupInfo(token, groupId)
			return res.json(groupRes);
		} catch (err) {
			onError(req, res, err);
		}
	}

	
    

    const router = express.Router();
	
	router.use(express.urlencoded({ extended: true }));
	
	// Homepage
	router.get('/', getHomepage);
	
	// Search page
	router.get('/search', getSearchPage);

    //Resource: /global/games
	router.get('/global/games', searchInGlobalGames);
    
	//Resource: /my/groups
	router.get('/my/groups', getGroups);
	router.post('/my/groups', createGroup);
	router.post('/my/groups/edit', editGroup);
	router.post('/my/groups/:groupId/delete', deleteGroup);
	router.get('/my/groups/:groupId/info', getGroupInfo);

	router.post('/my/groups/:groupId/:gameId', addGameToGroup);

	return router;
};