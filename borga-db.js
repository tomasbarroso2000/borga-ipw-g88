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

    const userGroupURL = username => `${baseURL}${es_spec.prefix}_${username.toLowerCase()}_groups`;
    const gamesURL = `${baseURL}${es_spec.prefix}_games`;
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

    async function checkGamesInit() {
        try {
            const checkGames = await fetch(
                `${gamesURL}`
            );
            if (!checkGames.ok) {
                const createGames = await fetch(
                    `${gamesURL}`,
                    {
                        method: 'PUT'
                    }
                );
                if (!createGames.ok) {
                    throw errors.FAIL('Database failure');
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    async function hasGame(gameId) {
        checkGamesInit();
        try {
            const response = await fetch(
                `${gamesURL}/_doc/${gameId}`
            );
            const answer = await response.json();
            return answer.found;
        } catch (err) { 
            console.log(err);
            throw errors.NOT_FOUND(err);
        }
    }


    async function hasGroup(username, groupId) {
        try {
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}`
            );
            const answer = await response.json();
            return answer.found;
        } catch (err) {
            console.log(err);
            throw errors.NOT_FOUND(err);
        }
    }

    async function hasGameInGroup(username, groupId, gameId) {
        try {
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}`
            );
            const answer = await response.json();
            const games = answer._source.games;
            return games.includes(gameId);
        } catch (err) {
            console.log(err);
            throw errors.NOT_FOUND(err);
        }
    }

    async function isUsernameTaken(username) {
        try {
            const answer = await fetch(`${usersURL}/_doc/${username}`);
            const response = await answer.json();
            return response.found;
        } catch (err) {
            throw errors.FAIL(err);
        }

    }

    async function checkUser(username) {
        if (!isUsernameTaken(username)) {
            throw errors.UNAUTHENTICATED(username);
        }
    }

    async function tokenToUsername(token) {
        const answer = await fetch(`${tokensURL}/_doc/${token}`)
        const response = await answer.json();
        if (!response.found) {
            throw errors.NOT_FOUND('Token does not exist');
        }
        return response._source[token];
    }

    async function saveGame(username, groupId, gameObj) {
        checkUser(username);
        const gameId = gameObj.id;
        if (! await hasGroup(username, groupId))
            throw errors.NOT_FOUND("Group does not exist");
        if (await hasGameInGroup(username, groupId, gameId))
            throw errors.INVALID_PARAM("Game already exists in group");
        try {
            if (! await hasGame(gameId)) {
                const response = fetch(
                    `${gamesURL}/_doc/${gameId}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(gameObj)
                    }
                );
                if (!response.ok) {
                    throw errors.FAIL('Could not add game')
                }
            }
            if (! await hasGameInGroup(username, groupId, gameId)) {
                const response = await fetch(
                    `${userGroupURL(username)}/_update/${groupId}?refresh=wait_for`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            script: {
                                source: "ctx._source.games.addAll(params.newGame)",
                                params: {
                                    newGame: [gameId]
                                }
                            }
                        })
                    }
                );
                if (response.ok) {
                    return successes.GAME_ADDED("Game added");
                } else {
                    throw errors.FAIL('Could not add game');
                }
            }
        } catch (err) {
            console.log(err);
            throw errors.FAIL(err);
        }
    }

    async function deleteGame(username, groupId, gameId) {
        checkUser(username);
        if (! await hasGroup(username, groupId))
            throw errors.NOT_FOUND("Group does not exist");
        if (! await hasGameInGroup(username, groupId, gameId))
            throw errors.NOT_FOUND("Game does not exist in group");
        if (! await hasGame(gameId))
            throw errors.NOT_FOUND("Game does not exist");
        try {
            const response = await fetch(
                `${userGroupURL(username)}/_update/${groupId}?refresh=wait_for`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        script: {
                            source: "ctx._source.games.removeAll(params.toRemove)",
                            params: {
                                toRemove: [gameId]
                            }
                        }
                    })
                }
            );
            if (response.ok) {
                return successes.GAME_REMOVED("Game removed");
            }
            else {
                throw errors.FAIL('Could not remove game');
            }
        } catch (err) {
            console.log(err);
            throw errors.FAIL(err);
        }
    }

    const listGames = async (username, groupId) => {
        try {
            const gamesList = [];
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}`
            );
            const answer = await response.json();
            const games = await answer._source.games;
            const gamesNames = await games.map(async element => {
                const gameRes = await fetch(`${gamesURL}/_doc/${element}`);
                const gameAnswer =  await gameRes.json();
                const game = await gameAnswer._source.name;
                gamesList.push(game);
                return game;
            });
            return Promise.all(gamesNames).then( () => {
                return gamesList;
            })
        } catch (err) {
            console.log(err);
            throw errors.NOT_FOUND(err);
        }
    }

    async function createGroup(username, groupName, groupDesc) {
        checkUser(username);
        let groupId = makeGroupId();
        while (await hasGroup(username, groupId)) {
            groupId = makeGroupId();
        }
        try {
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "name": groupName,
                        "description": groupDesc,
                        "games": []
                    })
                },

            );
            return successes.GROUP_CREATED("Group " + groupName + " added");
        } catch (err) {
            throw errors.FAIL(err);
        }
    }

    async function deleteGroup(username, groupId) {
        checkUser(username);
        if (! await hasGroup(username, groupId)) {
            throw errors.NOT_FOUND('This group does not exist');
        }

        try {
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}`,
                {
                    method: 'DELETE'
                }
            );
            if (response.status === 200) {
                return successes.GROUP_DELETED("Group removed with success");
            }
        } catch (err) {
            console.log(err);
            throw errors.FAIL(err);
        }
    }


    async function getGroups(username) {
        checkUser(username);
        try {
            const response = await fetch(
                `${userGroupURL(username)}/_search`
            );
            const answer = await response.json();
            const hits = await answer.hits.hits;
            const groups = {};
            hits.forEach(hit => {
                const group = hit._id;
                groups[group] = hit._source;
            });
            return groups;

        } catch (err) {
            console.log(err); 
            throw errors.FAIL(err);
        }
    }


    async function getGroupInfo(username, groupId) {
        checkUser(username);
        if (! await hasGroup(username, groupId)) {
            throw errors.NOT_FOUND("Group doesn't exist");
        }
        try {
            const response = await fetch(
                `${userGroupURL(username)}/_doc/${groupId}`
            );
            const answer = await response.json();
            const group = await answer._source;
            const games = await listGames(username, groupId);
            const groupObj = {
                name: group.name,
                description: group.description,
                games: games
            };
            return groupObj;
        } catch (err) {
            console.log(err);
            throw errors.FAIL(err);
        }
    }


    async function editGroup(username, groupId, newGroupName, newGroupDesc) {
        checkUser(username);
        try {
            if (! await hasGroup(username, groupId)) {
                throw errors.NOT_FOUND("Group doesn't exist");
            }
            const response = await fetch(
                `${userGroupURL(username)}/_update/${groupId}`,
                {
                    method: 'POST',
                    headers:
                    {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({script : `ctx._source.name='${newGroupName}';ctx._source.description='${newGroupDesc}'`})
                }
            );
            const answer = await response.json();
            return successes.GROUP_MODIFIED();
        } catch (err) {
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
                    headers:
                    {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ [newToken]: username })
                }
            );
            const usernameReq = await fetch(
                `${usersURL}/_doc/${username}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 'username': username })
                }
            );

            const userObj = await fetch(
                `${userGroupURL(username)}`,
                {
                    method: 'PUT'
                }
            );

            if (token.ok && usernameReq.ok && userObj.ok) {
                return successes.USER_ADDED("Username " + username + " added with token " + newToken);
            }
            else throw errors.FAIL("User Creation Failed")
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
        editGroup,
        getGroups,
        getGroupInfo,
        createUser,
        tokenToUsername
    }

}