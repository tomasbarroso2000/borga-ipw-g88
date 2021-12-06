'use strict';

const mem = require('../borga-data-mem');

describe('Users Related Tests', () => {
    test('create a user withou a name', async () => {
        try {
            const sut = await mem.createUser('');
        } catch (err) {
            expect(err.name).toEqual('MISSING_PARAM');
        }
    });

    test('create a user that already exists', async () => {
        try {
            const sut = await mem.createUser('membroTeste');
        } catch (err) {
            expect(err.name).toEqual('INVALID_PARAM');
        }
    });

    test('create a user successfully', async () => {
        const sut = await mem.createUser('ultimateGamer');
        expect(sut.name).toEqual('USER_ADDED');
    });

    test('save a game in a nonexistint group', async () => {
        try {
            const sut = await mem.saveGame(
                'membroTeste',
                'noobMaster',
                { "id": "74f9mzbw9Y", "name": "Exploding Kittens", "price": "19.82" }
            );
        } catch (err) {
            expect(err.name).toEqual('NOT_FOUND');
        }
    });

    test('save a game successfully', async () => {
        const sut = await mem.saveGame(
            'membroTeste',
            '12345',
            { "id": "74f9mzbw9Y", "name": "Exploding Kittens", "price": "19.82" }
        );
        expect(sut.name).toEqual('GAME_ADDED');
    });

    test('delete a game from a nonexistint group', async () => {
        try {
            const sut = await mem.deleteGame(
                'membroTeste',
                'noobMaster',
                '74f9mzbw9Y'
            );
        } catch (err) {
            expect(err.name).toEqual('NOT_FOUND');
        }
    });

    test('delete a game that is not in the group', async () => {
        try {
            const sut = await mem.deleteGame(
                'membroTeste',
                '12345',
                '74f9mzbw9Y'
            );
        } catch (err) {
            expect(err.name).toEqual('FAIL');
        }
    });
});