'use strict';

const express = require('express');
const path = require('path');

module.exports = function (services, guest_token) {

	function getToken(req) {
		return guest_token;
	}
	
	async function getHomepage(req, res) {
		const header = 'Popular Games';
        const games = await services.getPopularGames();
		res.render(
			'games', 
			{ header, games }
		);
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
                { header, query, games }
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

	async function getGroups(req, res) {
		const header = "My Groups";
		try {
			const token = getToken(req);
			const groupRes = await services.getGroups(token);
			res.render(
                'groups',
                { header, groupRes, groupSelect: false }
            );
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'groups',
						{ header, error:'no groups found' }
					);
					break;
				case 'UNAUTHENTICATED':
					res.status(401).render('groups', { header, error: 'login required' });
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

	async function createGroup(req, res) {
		try {
			const groupName = req.body.name;
			const groupDesc = req.body.description;
			const token = getToken(req);
			await services.createGroup(token, groupName, groupDesc);
			res.redirect(`/my/groups`);
		} catch (err) {
            switch (err.name) {
                case 'MISSING_PARAM':
                    res.status(400).render('getGroupDetails', { header, error: 'no name or description provided' });
                    break;
                case 'UNAUTHENTICATED':
                    res.status(401).render('getGroupDetails', { header, error: 'login required' });
                    break;
                default:
                    console.log(err);
                    res.status(500).render('getGroupDetails', { header, error: JSON.stringify(err) });
                    break;
            }
		}
	}

	async function editGroup(req, res) {
		const header = "Edit Group";
		try {
			const groupId = req.body.id;
			const newGroupName = req.body.name;
			const newGroupDesc = req.body.description;
			const token = getToken(req);
			const groupRes = await services.editGroup(token, groupId, newGroupName, newGroupDesc);
			res.redirect(`/my/groups`);
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'getGroupDetails',
						{ header, error:'no groups found' }
					);
					break;
				case 'UNAUTHENTICATED':
					res.status(401).render(
						'getGroupDetails', { header, error: 'login required' }
						);
					break;
				default:
					res.status(500).render(
						'getGroupDetails',
						{ header, error: JSON.stringify(err) }
					);
					break;
			}
		}
	}

	async function deleteGroup(req, res) {
		try {
			const groupId = req.params.groupId;
			const token = getToken(req);
			await services.deleteGroup(token, groupId);
			res.redirect(`/my/groups`);
		} catch (err) {
			onError(req, res, err);
		}
	}

	async function getGroupInfo(req, res) {
		const header = "Group Information"
		try {
			const token = getToken(req);
			const groupId = req.params.groupId;
			const gameObjs = await services.listGameObjs(token, groupId);
			const group = await services.getGroupInfo(token, groupId);
			res.render(
                'groupInfo',
                { header, group, gameObjs, groupId }
            );
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'groups',
						{ header, error:'no group found' }
					);
					break;
				case 'UNAUTHENTICATED':
					res.status(401).render('groups', { header, error: 'login required' });
					break;
				default:
					res.status(500).render(
						'group',
						{ header, error: JSON.stringify(err) }
					);
					break;
			}
		}
	}
	
	async function addGameToGroup(req, res) {
        const header = 'Add Game';
        const token  = getToken(req);
        const gameId = req.params.gameId;
		const groupId = req.params.groupId;
        try {
            await services.addGame(token, groupId, gameId);
            res.redirect(`/my/groups/${gameId}/select`);
        } catch (err) {
            switch (err.name) {
                case 'MISSING_PARAM':
                    res.status(400).render('games', { header, error: 'no gameId provided' });
                    break;
                case 'UNAUTHENTICATED':
                    res.status(401).render('games', { header, error: 'login required' });
                    break;
                case 'NOT_FOUND':
                    res.status(404).render('games', { header, error: `no game found with id ${gameId}` });
                    break;
                default:
                    console.log(err);
                    res.status(500).render('games', { header, error: JSON.stringify(err) });
                    break;
            }
        }
	}

	async function deleteGameFromGroup(req, res) {
		const header = 'Delete Game';
        const token  = getToken(req);
        const gameId = req.params.gameId;
		const groupId = req.params.groupId;
        try {
            await services.deleteGame(token, groupId, gameId);
            res.redirect(`/my/groups/${groupId}/info`);
        } catch (err) {
            switch (err.name) {
                case 'MISSING_PARAM':
                    res.status(400).render('games', { header, error: 'no gameId provided' });
                    break;
                case 'UNAUTHENTICATED':
                    res.status(401).render('games', { header, error: 'login required' });
                    break;
                case 'NOT_FOUND':
                    res.status(404).render('games', { header, error: `no game found with id ${gameId}` });
                    break;
                default:
                    console.log(err);
                    res.status(500).render('games', { header, error: JSON.stringify(err) });
                    break;
            }
        }
	}

	async function getGroupNewInfo(req, res) {
		const header = "Edit Group";
		try {
			const token = getToken(req);
			const groupId = req.params.groupId;
			
			res.render(
                'getGroupDetails',
                { header, groupId, createGroup: false }
            );
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'getGroupDetails',
						{ header, error:'no group found' }
					);
					break;
				case 'UNAUTHENTICATED':
					res.status(401).render('getGroupDetails', { header, error: 'login required' });
					break;
				default:
					res.status(500).render(
						'getGroupDetails',
						{ header, error: JSON.stringify(err) }
					);
					break;
			}
		}
	}

	async function  getNewGroupInfo(req, res) {
		const header = "Create New Group";
		try {
			const token = getToken(req);
			const groupId = req.params.groupId;
			
			res.render(
                'getGroupDetails',
                { header, groupId, createGroup: true }
            );
		} catch (err) {
			switch (err.name) {
				case 'UNAUTHENTICATED':
					res.status(401).render('getGroupDetails', { header, error: 'login required' });
					break;
				default:
					res.status(500).render(
						'getGroupDetails',
						{ header, error: JSON.stringify(err) }
					);
					break;
			}
		}
	}

	async function getGameInfo(req, res) {
		const header = "Game Information"
		try {
			const gameId = req.params.gameId
			const gameObj = await services.getGameInfo(gameId);
			res.render(
                'gameInfo',
                { header, gameObj }
            );
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'gameInfo',
						{ header, error:'no game found' }
					);
					break;
				default:
					res.status(500).render(
						'gameInfo',
						{ header, error: JSON.stringify(err) }
					);
					break;
			}
		}
	}

	async function selectGroup(req, res) {
		const header = "Select Group";
		try {
			const token = getToken(req);
			const gameId = req.params.gameId;
			const groupRes = await services.getGroups(token);
			res.render(
                'groups',
                { header, groupRes, groupSelect: true, gameId }
            );
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'groups',
						{ header, error:'no groups found' }
					);
					break;
				case 'UNAUTHENTICATED':
					res.status(401).render('groupEdit', { header, error: 'login required' });
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

	
    

    const router = express.Router();
	
	router.use(express.urlencoded({ extended: true }));
	
	// Homepage
	router.get('/', getHomepage);
	
	// Search page
	router.get('/search', getSearchPage);

    //Resource: /global/games
	router.get('/global/games', searchInGlobalGames);
	router.get('/global/games/:gameId/info', getGameInfo);
    
	//Resource: /my/groups
	router.get('/my/groups', getGroups);
	router.post('/my/groups', createGroup);
	router.post('/my/groups/edit', editGroup);
	router.post('/my/groups/:groupId/delete', deleteGroup);
	router.get('/my/groups/:groupId/info', getGroupInfo);
	router.get('/my/groups/:groupId/edit', getGroupNewInfo);
	router.get('/my/groups/create', getNewGroupInfo);

	router.get('/my/groups/:gameId/select', selectGroup);

	router.post('/my/groups/:groupId/:gameId', addGameToGroup);
	router.post('/my/groups/:groupId/:gameId/delete', deleteGameFromGroup);

	return router;
};