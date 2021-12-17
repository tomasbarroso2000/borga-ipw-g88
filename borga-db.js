'use strict';

const responseCodes = require('./borga-responseCodes');
const fetch = require('node-fetch');
const errors = responseCodes.errorList;
const successes = responseCodes.successList;
const crypto = require('crypto');

module.exports = function (
    es_spec, 
    guest
) {
    const baseURL = `${es_spec.url}`;

    const userGroupURL = username => `${baseURL}${es_spec.prefix}_${username}_groups`;
    const usersURL = `${baseURL}${es_spec.prefix}_users`;
    const tokensURL = `${baseURL}${es_spec.prefix}_tokens`;

    //TO DO: MOVE TO DB
    const users = new Set([
        guest.user
    ]);

    //TO DO: MOVE TO DB
    const tokens = {
        [guest.token]: guest.user
    };

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
    
    async function isUsernameTaken(username) {
        try{
            const answer = await fetch(`${usersURL}/_doc/${username}`);
            return answer.found;  
        } catch(err) {
            throw errors.FAIL(err);
        }
        
    }
    
    async function checkUser(username) {
        if(!isUsernameTaken(username)) {
            throw errors.UNAUTHENTICATED(username);
        }
    }

    async function tokenToUsername(token) {
        const answer = await fetch(`${tokensURL}/_doc/${token}`);
        if (!answer.found) {
            throw errors.NOT_FOUND('Token does not exist');
        }
        return answer['_source'].token;
    }

    async function saveGame(username, groupId, gameObj){
        checkUser(username);
        const gameId = gameObj.id;
        const hasGroup = await hasGroup(username, groupId);
        const hasGameInGroup = await hasGameInGroup(username, groupId, gameId);
        const hasGame = await hasGame(gameId);

        if(!hasGroup)
            throw errors.NOT_FOUND("Group does not exist");
        if(hasGameInGroup)
            throw errors.NOT_FOUND("Game already exist in group");
        try {
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
            //const answer = await response.json();
            if(response.status === 200) {
                return successes.GAME_ADDED("Game added");
            }
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

        if(!hasGroup)
                throw errors.NOT_FOUND("Group does not exist");
        if(!hasGameInGroup)
            throw errors.NOT_FOUND("Game does not exist in group");
        if(!hasGame)
            throw errors.NOT_FOUND("Game does not exist"); 
        try {
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}/${gameId}?refresh=wait_for`,
                {
                    method: 'DELETE'
                }
            );
            if(response.status === 200) {
                //const answer = await response.json();
                return successes.GAME_REMOVED("Game removed");
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

    async function createGroup(username, groupName, groupDesc) {
        checkUser(username);
        let groupId = makeGroupId();
        while(await hasGroup(username, groupId)){
            groupId = makeGroupId();
        }
        try{
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        "name":groupName,
                        "description":groupDesc,
                        "games": []
                    }
                },
                
            );
            return successes.GROUP_ADDED("Group " + groupName + " added");
        } catch (err) {
            throw errors.FAIL(err);
        }
    }

    async function deleteGroup(username, groupId) {
        checkUser(username);
        const hasGroup = await hasGroup(username, groupId);
        if(!hasGroup){
            throw errors.NOT_FOUND('This group does not exist');
        }

        try{
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}`,
                {
                    method: 'DELETE'
                }
            );
            if(response.status === 200) {
                return successes.GROUP_DELETED("Group removed with success");
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
                `${userGroupURL(username)}/_search`
            );
            const answer = await response.json();
            const hits = await answer.hits.hits;
            const groups = {};
            hits.forEach(async hit => {
                const group = await hit[_id];
                groups[group] = hit[_source];
            });
            //return groups.groups; // ?? 
            return groups;

        } catch (err) {
            console.log(err);
            throw errors.FAIL(err);
        }
    }

    
    async function getGroupInfo(username, groupId){
        checkUser(username);
        const hasGroupInUser = await hasGroup(username, groupId);
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
        if (await isUsernameTaken(username)) {
            throw errors.INVALID_PARAM("Username " + username + " already exists");
        }
        try {
            const newToken = crypto.randomUUID();
            const token = await fetch(
                `${tokensURL}/_doc/${newToken}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        [newToken]: username
                    }
                }
            );
            const username = await fetch(
                `${usersURL}/_doc/${username}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        'username': username
                    }
                }
            );

            const userObj = await fetch(
                `${userGroupURL(username)}`,
                {
                    method: 'PUT'
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
        createGroup,
        getGroups,
        getGroupInfo,
        createUser,
        tokenToUsername
    }

}