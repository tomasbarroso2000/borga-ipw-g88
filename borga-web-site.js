'use strict';

const express = require('express');

module.exports = function (services, guest_token) {

	function getToken(req) {
		return req.user && req.user.token;
	}

	function getUsername(req) {
		return req.user && req.user.username;
	}

	async function getUserInfo(req, res) {
		const header = "Create User";
		try {
			res.render(
				'userInfo',
				{ header, create: true, username: false }
			);
		} catch (err) {
			res.status(500).render(
				'userInfo',
				{ header, create: true, error: JSON.stringify(err), username: false }
			);
		}
	}
	

	async function createUser(req, res) {
		try {
			const header = "Create User";
			const username = req.body.username;
			const password = req.body.password;
			await services.createUser(username, password);
			res.redirect(`/`);
		} catch (err) {
			switch (err.name) {
				case 'MISSING_PARAM':
					res.status(400).render('userInfo', { header, error: 'no username or password provided', creation: true, username: false });
					break;
				default:
					console.log(err);
					res.status(500).render('userInfo', { header, error: JSON.stringify(err), creation: true, username: false });
					break;
			}
		}
	}


	async function getHomepage(req, res) {
		const header = 'Popular Games';
		const games = await services.getPopularGames();
		res.render(
			'games',
			{ header, games, username: getUsername(req) }
		);
	}
	
	
	function getAboutPage(req, res) {
		res.render('about', {username: getUsername(req)})
	}

	function getSearchPage(req, res) {
		res.render('search', {username: getUsername(req)})
	}

	function getLoginPage(req, res) {
		const header = "Login";
		res.render('userInfo', {header, creation: false, username: false }  );
	}

	async function doLogin(req, res){
		const username = req.body.username;
		const password = req.body.password;

		try{
			const user = await services.checkAndGetUser(username, password);
			req.login({ username: user.username, token: user.token}, err => {
				if (err) {
					console.log('LOGIN ERROR', err);
				}
				res.redirect('/');
			});
		} catch (err) {
			// TO DO : improve error handling
			console.log('LOGIN EXCEPTION', err);
			res.redirect('/');
		}
	}

	function doLogout(req, res){
		req.logout();
		res.redirect('/');
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
				{ header, query, games, username: getUsername(req)}
			);
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'games',
						{ header, query, error: 'no game found for this query', username: getUsername(req)}
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
				{ header, groupRes, groupSelect: false, username: getUsername(req) }
			);
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'groups',
						{ header, error: 'no groups found', username: getUsername(req) }
					);
					break;
				case 'UNAUTHENTICATED':
					res.status(401).render('groups', { header, error: 'login required' });
					break;
				default:
					res.status(500).render(
						'groups',
						{ header, error: JSON.stringify(err),  username: getUsername(req)}
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
					res.status(400).render('getGroupDetails', { header, error: 'no name or description provided', username: getUsername(req) });
					break;
				case 'UNAUTHENTICATED':
					res.status(401).render('getGroupDetails', { header, error: 'login required' });
					break;
				default:
					console.log(err);
					res.status(500).render('getGroupDetails', { header, error: JSON.stringify(err), username: getUsername(req) });
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
						{ header, error: 'no groups found', username: getUsername(req) }
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
						{ header, error: JSON.stringify(err), username: getUsername(req) }
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
				{ header, group, gameObjs, groupId, username: getUsername(req) }
			);
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'groups',
						{ header, error: 'no group found', username: getUsername(req) }
					);
					break;
				case 'UNAUTHENTICATED':
					res.status(401).render('groups', { header, error: 'login required' });
					break;
				default:
					res.status(500).render(
						'group',
						{ header, error: JSON.stringify(err), username: getUsername(req) }
					);
					break;
			}
		}
	}

	async function addGameToGroup(req, res) {
		const header = 'Add Game';
		const token = getToken(req);
		const gameId = req.params.gameId;
		const groupId = req.params.groupId;
		try {
			await services.addGame(token, groupId, gameId);
			res.redirect(`/my/groups/${gameId}/selection`);
		} catch (err) {
			switch (err.name) {
				case 'MISSING_PARAM':
					res.status(400).render('games', { header, error: 'no gameId provided', username: getUsername(req) });
					break;
				case 'UNAUTHENTICATED':
					res.status(401).render('games', { header, error: 'login required' });
					break;
				case 'NOT_FOUND':
					res.status(404).render('games', { header, error: `no game found with id ${gameId}`, username: getUsername(req) });
					break;
				default:
					console.log(err);
					res.status(500).render('games', { header, error: JSON.stringify(err), username: getUsername(req) });
					break;
			}
		}
	}

	async function deleteGameFromGroup(req, res) {
		const header = 'Delete Game';
		const token = getToken(req);
		const gameId = req.params.gameId;
		const groupId = req.params.groupId;
		try {
			await services.deleteGame(token, groupId, gameId);
			res.redirect(`/my/groups/${groupId}/info`);
		} catch (err) {
			switch (err.name) {
				case 'MISSING_PARAM':
					res.status(400).render('games', { header, error: 'no gameId provided', username: getUsername(req) });
					break;
				case 'UNAUTHENTICATED':
					res.status(401).render('games', { header, error: 'login required' });
					break;
				case 'NOT_FOUND':
					res.status(404).render('games', { header, error: `no game found with id ${gameId}`, username: getUsername(req) });
					break;
				default:
					console.log(err);
					res.status(500).render('games', { header, error: JSON.stringify(err), username: getUsername(req) });
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
				{ header, groupId, createGroup: false, username: getUsername(req) }
			);
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'getGroupDetails',
						{ header, error: 'no group found', username: getUsername(req) }
					);
					break;
				case 'UNAUTHENTICATED':
					res.status(401).render('getGroupDetails', { header, error: 'login required' });
					break;
				default:
					res.status(500).render(
						'getGroupDetails',
						{ header, error: JSON.stringify(err), username: getUsername(req) }
					);
					break;
			}
		}
	}

	async function getNewGroupInfo(req, res) {
		const header = "Create New Group";
		try {
			const token = getToken(req);

			res.render(
				'getGroupDetails',
				{ header, createGroup: true, username: getUsername(req) }
			);
		} catch (err) {
			switch (err.name) {
				case 'UNAUTHENTICATED':
					res.status(401).render('getGroupDetails', { header, error: 'login required' });
					break;
				default:
					res.status(500).render(
						'getGroupDetails',
						{ header, error: JSON.stringify(err), username: getUsername(req) }
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
				{ header, gameObj, username: getUsername(req) }
			);
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'gameInfo',
						{ header, error: 'no game found', username: getUsername(req) }
					);
					break;
				default:
					res.status(500).render(
						'gameInfo',
						{ header, error: JSON.stringify(err), username: getUsername(req) }
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
				{ header, groupRes, groupSelect: true, gameId, username: getUsername(req) }
			);
		} catch (err) {
			switch (err.name) {
				case 'NOT_FOUND':
					res.status(404).render(
						'groups',
						{ header, error: 'no groups found', username: getUsername(req) }
					);
					break;
				case 'UNAUTHENTICATED':
					res.status(401).render('groupEdit', { header, error: 'login required' });
					break;
				default:
					res.status(500).render(
						'groups',
						{ header, error: JSON.stringify(err), username: getUsername(req) }
					);
					break;
			}
		}
	}

	const router = express.Router();

	router.use(express.urlencoded({ extended: true }));

	// Homepage
	router.get('/', getHomepage);

	// About page
	router.get('/about', getAboutPage);

	// Search page
	router.get('/search', getSearchPage);

	// Authentication page
	router.get('/authentication', getLoginPage);

	// Login action
	router.post('/login', doLogin);
	router.get('/users/new', getUserInfo);
	router.post('/users', createUser)

	// Logout action
	router.post('/logout', doLogout);

	// Resource: /global/games
	router.get('/global/games', searchInGlobalGames);
	router.get('/global/games/:gameId/info', getGameInfo);

	// Resource: /my/groups
	router.get('/my/groups', getGroups);
	router.post('/my/groups', createGroup);
	router.post('/my/groups/edit', editGroup);
	//router.post('/my/groups/:groupId/delete', deleteGroup);
	router.get('/my/groups/:groupId/info', getGroupInfo);
	router.get('/my/groups/:groupId/edit', getGroupNewInfo);
	router.get('/my/groups/new', getNewGroupInfo);

	router.get('/my/groups/:gameId/selection', selectGroup);

	router.post('/my/groups/:groupId/:gameId', addGameToGroup);
	router.post('/my/groups/:groupId/:gameId/delete', deleteGameFromGroup);

	return router;
};