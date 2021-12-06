'use strict';

const mem = require('../borga-data-mem');


describe('Users Related Tests', () => {
    test('create a user withou a name', () => {
        try {
            const sut = mem.createUser('');
        } catch (err) {
            expect(err.name).toEqual('MISSING_PARAM');
        }
    });

    test('create a user that already exists', () => {
        try {
            const sut = mem.createUser('membroTeste');
        } catch (err) {
            expect(err.name).toEqual('FAIL');
        }
    });

    test('create a user successfully', () => {
        const sut = mem.createUser('ultimateGamer');
        expect(sut.name).toEqual('USER_ADDED');
    });

    test('save a game in a nonexistint group', () => {
        try {
            const sut = mem.saveGame(
                'membroTeste',
                'noobMaster',
                { "id": "74f9mzbw9Y", "name": "Exploding Kittens", "price": "19.82" }
            );
        } catch (err) {
            expect(err.name).toEqual('FAIL');
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

    test('delete a game from a nonexistint group', () => {
        try {
            const sut = mem.deleteGame(
                'membroTeste',
                'noobMaster',
                '74f9mzbw9Y'
            );
        } catch (err) {
            expect(err.name).toEqual('FAIL');
        }
    });

    test('delete a game that is not in the group', () => {
        try {
            const sut = mem.deleteGame(
                'membroTeste',
                '12345',
                '74f9mzbw9Y'
            );
        } catch (err) {
            expect(err.name).toEqual('FAIL');
        }
    });
});