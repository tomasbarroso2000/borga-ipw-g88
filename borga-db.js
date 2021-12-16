'use strict';

const responseCodes = require('./borga-responseCodes');
const fetch = require('node-fetch');
const errors = responseCodes.errorList;
const successes = responseCodes.successList;
const crypto = require('crypto');

module.exports = function (
    es_host,
    es_port,
    idx_prefix,
    guest_user,
    guest_token
) {
    const baseURL = `http://${es_host}:${es_port}`;

    const userGroupURL = username => `${baseURL}/${idx_prefix}_${username}_groups`;

    //TO DO: MOVE TO DB
    const users = new Set([
        guest_user
    ]);

    //TO DO: MOVE TO DB
    const tokens = {
        [guest_token]: guest_user
    };


    function checkUser(username) {
        if(!users.has(username)) {
            throw errors.UNAUTHENTICATED(username);
        }
    }


    async function tokenToUsername(token) {
        return tokens[token];
    }


    async function hasGame(gameId){
        checkUser(username);
        try{
            const response = await fetch(
                `${baseURL}/_doc/${gameId}`
            );
            return response.status === 200;
        } catch(err) {
            console.log(err);
            throw errors.NOT_FOUND(err);
        }
    }


    async function hasGroup(username, groupId){
        try{
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}`
            );
            return response.status === 200;
        } catch(err) {
            console.log(err);
            throw errors.NOT_FOUND(err);
        }
    }


    async function hasGameInGroup(username, groupId, gameId) {
        try{
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}/${gameId}`
            );
            return response.status === 200;
        } catch(err) {
            console.log(err);
            throw errors.NOT_FOUND(err);
        }
    }


    async function saveGame(username, groupId, gameObj){
        checkUser(username);
        const gameId = gameObj.id;
        const hasGroup = await hasGroup(username, groupId);
        const hasGameInGroup = await hasGameInGroup(username, groupId, gameId);
        const hasGame = await hasGame(gameId);
        try {
            if(!hasGroup)
                throw errors.NOT_FOUND("Group does not exist");
            if(hasGameInGroup)
                throw errors.NOT_FOUND("Game already exist in group");
            if(!hasGame) {
                const response = fetch(
                    `${baseURL}/_doc/${gameId}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(gameObj)
                    }
                );
            }
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}/${gameId}?refresh=wait_for`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            const answer = await response.json();
            return answer._id;
        } catch (err) {
            console.log(err);
            throw errors.FAIL(err);
        }
    }


    async function deleteGame(username, groupId, gameId){
        checkUser(username);
        const hasGroup = await hasGroup(username, groupId);
        const hasGameInGroup = await hasGameInGroup(username, groupId, gameId);
        const hasGame = await hasGame(gameId);
        try {
            if(!hasGroup)
                throw errors.NOT_FOUND("Group does not exist");
            if(!hasGameInGroup)
                throw errors.NOT_FOUND("Game does not exist in group");
            if(!hasGame)
                throw errors.NOT_FOUND("Game does not exist"); 
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}/${gameId}?refresh=wait_for`,
                {
                    method: 'DELETE'
                }
            );
            if(response.status === 200) {
                const answer = await response.json();
                return answer._id;
            }
        } catch (err) {
            console.log(err);
            throw errors.FAIL(err);
        }
    }

    const listGames = async (username, groupId) => {
        const gamesList = [];
        try{
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}`
            );
            const answer = await response.json();
            const hits = answer.hits.hits;
            const games = hits.map(hit => hit._source);
            games.array.forEach(async element => {
                const answer = await fetch(`${baseURL}/_doc/${element}`).json().hits.hits.map(hit => hit._source);
                gamesList.push(answer);
            });
            return gamesList;
        } catch (err){
            console.log(err);
            throw errors.NOT_FOUND(err);
        }
    }


    async function deleteGroup(username, groupId) {
        checkUser(username);
        const hasGroup = await hasGroup(username, groupId);
        if(!hasGroup)
            throw errors.NOT_FOUND('This group does not exist');
        try{
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}`,
                {
                    method: 'DELETE'
                }
            );
            if(response.status === 200) {
                const answer = await response.json();
                return answer._id;
            }
        } catch (err) {
            console.log(err);
            throw errors.FAIL(err);
        }
    }


    async function getGroups(username){
        checkUser(username);
        try{
            const response = await fetch(
                `${userGroupURL(username)}/_doc`
            );
            const groups = response.json();
            return groups.groups; // ?? 

        } catch (err) {
            console.log(err);
            throw errors.FAIL(err);
        }
    }

    
    async function getGroupInfo(username, groupId){
        checkUser(username);
        const hasGroupInUser = await hasGroup(user, groupId);
	    if (!hasGroupInUser) {
		    throw errors.NOT_FOUND("Group doesn't exist");
	    }
        try{
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}`
            );
            const group = response.json();
            const groupObj = {
                name: group.name,
                description: group.description,
                games: await listGames(group)
            };
            return groupObj;
        } catch (err) {
            console.log(err);
            throw errors.FAIL(err);
        }
    }


    async function createUser(username) {
        if (checkUser(username)) {
            throw errors.INVALID_PARAM("Username " + username + " already exists");
        }
        const newToken = crypto.randomUUID();
        tokens[newToken] = username;
        try {
            const response = await fetch(
                userGroupURL(username),
                {
                    method: 'POST'
                }
            );
            return successes.USER_ADDED("Username " + username + " added with token " + newToken);
        }
        catch (err) {
            throw errors.FAIL(err);
        }
    }

    return {
        saveGame,
        deleteGame,
        deleteGroup,
        getGroups,
        getGroupInfo,
        createUser
    }

}




/**
 *  BORGA-DATA-MEM
 */



function makeGroupId() {
	const length = 8;
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

function createUser(username) {
	if (!username) {
		throw errors.MISSING_PARAM("Unspecified username");
	}
	const user = users[username];
	if (user) {
		throw errors.INVALID_PARAM("Username " + username + " already exists");
	}
	const newToken = crypto.randomUUID();
	tokens[newToken] = username;
	users[username] = {};
	return successes.USER_ADDED("Username " + username + " added with token " + newToken);
}

async function getGroups(username) {
	const groups = users[username];
	return groups;
}

function createGroup(username, groupName, groupDesc) {
	let groupId = makeGroupId();
	const user = users[username];
	while (user[groupId]) {
		groupId = makeGroupId();
	}
	user[groupId] = { 'name': groupName, 'description': groupDesc, 'games': [] };
	return successes.GROUP_CREATED('Group ' + groupName + ' created');
}

async function editGroup(username, groupId, newGroupName, newGroupDesc) {
	const user = users[username];
	const group = user[groupId];
	const hasGroupInUser = await hasGroup(user, groupId);
	if (!hasGroupInUser) {
		throw errors.NOT_FOUND("Group doesn't exist");
	}
	group.description = newGroupDesc;
	group.name = newGroupName;
	return successes.GROUP_MODIFIED("Group Name: " + newGroupName + " | Group Description: " + newGroupDesc);
}


