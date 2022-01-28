'use strict';

const service_builder = require('../borga-services.js');

const config = require('../borga-config');

const mock_data_ext = require('borga-games-data');

const test_data_int = require('../borga-data-mem')(config.guest);

const testToken = '1365834658346586';

const testUser = {
    'membroTeste': {
        '12345': { "id": "12345", "name": "grupo_teste", "description": "grupo para testes", "games": [] }
    }
}

const default_services = service_builder(
    mock_data_ext,
    test_data_int
);

describe('Search Tests', () => {
    test('search game without a query', async () => {
        const services = default_services;
        try {
            await services.searchGame(undefined);
        } catch (err) {
            expect(err.name).toEqual('MISSING_PARAM');
            return
        }
    });

    test('search nonexisting game', async () => {
        const services = default_services;
        try {
            await services.searchGame('alex+o+leao');
        } catch (err) {
            expect(err.name).toEqual('INVALID_PARAM')
        }
    });

    test('search for existing game', async () => {
        const services = default_services;
        const sut = await services.searchGame('exploding+kittens');
        expect(sut).toBeDefined();
        expect(sut).toEqual([mock_data_ext.games['74f9mzbw9Y']])
    });
});


describe('Group Related Tests', () => {
    test('create a group without giving him a name', async () => {
        const services = default_services;
        try {
            const sut = await services.createGroup(testToken, '', 'SLB é o maior')
        } catch (err) {
            expect(err.name).toEqual('MISSING_PARAM');
        }
    });

    test('add game to group without a token', async () => {
        const services = default_services;
        try {
            const game = mock_data_ext.games['74f9mzbw9Y'];
            const group = testUser.membroTeste[12345];
            const sut = await services.addGame('', group, game);
        } catch (err) {
            expect(err.name).toEqual('UNAUTHENTICATED');
            return;
        }
    });

    test('add game to group without specifying the group', async () => {
        const services = default_services;
        try {
            const game = mock_data_ext.games['74f9mzbw9Y'];
            const token = '1365834658346586';
            const sut = await services.addGame(token, undefined, game);
        } catch (err) {
            expect(err.name).toEqual('MISSING_PARAM');
            return;
        }
    });

    test('add game to group without specifying the game', async () => {
        const services = default_services;
        try {
            const group = testUser.membroTeste[12345];
            const token = '1365834658346586';
            const sut = await services.addGame(token, group, undefined);
        } catch (err) {
            expect(err.name).toEqual('MISSING_PARAM');
            return;
        }
    });

    test('add game to a nonexisting group', async () => {
        const services = default_services;
        try {
            const group = '123456';
            const game = '74f9mzbw9Y';
            const sut = await services.addGame(testToken, group, game);
        } catch (err) {
            expect(err.name).toEqual('NOT_FOUND');
            return;
        }
    });

    test('add an invalid game to a group', async () => {
        const services = default_services;
        try {
            const group = testUser.membroTeste[12345];
            const game = {
                id: '1234567',
                name: 'jogo invalido',
                price: 'gratis',
            };
            const sut = await services.addGame(testToken, group, game);
        } catch (err) {
            expect(err.name).toEqual('NOT_FOUND');
            return;
        }
    });

    test('delete a game from a nonexisting group', async () => {
        const services = default_services;
        try {
            const game = mock_data_ext.games['74f9mzbw9Y'];
            const group = '54321';
            const sut = await services.deleteGame(testToken, group, game)
        } catch (err) {
            expect(err.name).toEqual('NOT_FOUND')
        }
    });

    test('delete an invalid game from a group', async () => {
        const services = default_services;
        try {
            const game = {
                id: '1234567',
                name: 'jogo invalido',
                price: 'gratis',
            };;
            const group = testUser.membroTeste[12345];
            const sut = await services.deleteGame(testToken, group, game)
        } catch (err) {
            expect(err.name).toEqual('NOT_FOUND')
        }
    });

    test('get groups of a nonexisting user', async () => {
        const services = default_services;
        try {
            const sut = await services.getGroups('123456789');
        } catch (err) {
            expect(err.name).toEqual('UNAUTHENTICATED');
        }
    });

    test('get groups from an existing user', async () => {
        const services = default_services;
        const expectedGroup = testUser.membroTeste
        const sut = await services.getGroups(testToken);
        expect(sut).toEqual(expectedGroup);
    });

    test('get popular games', async () => {
        const services = default_services;
        const expectedGames = [
            { "id": "TAAifFP590", "name": "Root", "price": "0.00" },
            { "id": "yqR4PtpO8X", "name": "Scythe", "price": "54.92" }
        ]
        const sut = await services.getPopularGames();
        expect(sut).toEqual(expectedGames);
    });

    test('edit group without a groupId', async () => {
        const services = default_services;
        try {
            const sut = await services.editGroup(testToken, undefined, 'newGroupName', 'newGroupDesc');
        } catch (err) {
            expect(err.name).toEqual('MISSING_PARAM')
        }
    });

    test('get group info without a group id', async () => {
        const services = default_services;
        try {
            const sut = await services.getGroupInfo(testToken, '');
        } catch (err) {
            expect(err.name).toEqual('MISSING_PARAM')
        }
    });

});

describe('User Related Tests', () => {
    test('get the username of a user without a token', async () => {
        const services = default_services;
        try {
            await services.getUsername(undefined)
        } catch (err) {
            expect(err.name).toEqual('UNAUTHENTICATED');
            return
        }
    });

    test('get the username of a user using the token', async () => {
        const services = default_services;
        const username = await services.getUsername(testToken);
        expect(username).toEqual('membroTeste');
    });
});