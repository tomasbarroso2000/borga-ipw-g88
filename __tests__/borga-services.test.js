'use strict';

const errorList = require('../borga-responseCodes');

const service_builder = require('../borga-services.js');

const mock_data_ext = require('borga-games-data');

const test_data_ext = require('../board-games-data')

const test_data_int = require('../borga-data-mem');

const testToken = '1365834658346586';

const default_services = service_builder(
    mock_data_ext,
    test_data_int
);

describe ('Search Tests', () => {
    test('search game without a query', async () => {
        const services = default_services;
        try{
            await services.searchGame(undefined);
        } catch (err) {
            expect(err.name).toEqual('MISSING_PARAM');
            return
        }
    });

    /*
    test('search nonexisting game', async () => {
        const services = default_services;
        try{
            await services.searchGame('alex+o+leao');
        } catch(err) {
            expect(err.name).toEqual('INVALID_PARAM')
        }
    });
    
    test('search for existing game', async () => {
        const services = default_services;
        const sut = await services.searchGame('exploding+kittens');
        expect(sut).toBeDefined();
        expect(sut.game).toEqual(mock_data_ext.games['74f9mzbw9Y'])
    });
    */
});


describe('Group Related Tests', () => {
    test('add game to group without a token', async () => {
        const services = default_services;
        try{
            const game = mock_data_ext.games['74f9mzbw9Y'];
            const group = test_data_int.users.membroTeste[12345];
            const sut = await services.addGame('', group, game);
        } catch(err){
            expect(err.name).toEqual('UNAUTHENTICATED');
            return;
        }
    });

    test('add game to group without specifying the group', async () => {
        const services = default_services;
        try{
            const game = mock_data_ext.games['74f9mzbw9Y'];
            const token = '1365834658346586';
            const sut = await services.addGame(token, undefined, game);
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAM');
            return;
        }
    });

    test('add game to group without specifying the game', async () => {
        const services = default_services;
        try{
            const group =  test_data_int.users.membroTeste[12345];
            const token = '1365834658346586';
            const sut = await services.addGame(token, group, undefined);
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAM');
            return;
        }
    });

    test('add game to a nonexisting group', async () => {
        const services = default_services;
        try{
            const group =  '123456';
            const game = '74f9mzbw9Y';
            const sut = await services.addGame(testToken, group, game);
        } catch(err){
            expect(err.name).toEqual('FAIL');
            return;
        }
    });

    /*
    test('add an invalid game to a group', async () => {
        const services = default_services;
        try{
            const group =  test_data_int.users.membroTeste[12345];
            const game = {
                id: '1234567',
                name: 'jogo invalido',
                price: 'gratis',
            };
            const sut = await services.addGame(testToken, group, game);
        } catch(err){
            expect(err.name).toEqual('INVALID_PARAM');
            return;
        }
    }); */

    test('delete a game from a nonexisting group', async() => {
        const services = default_services;
        try {
            const game = mock_data_ext.games['74f9mzbw9Y'];
            const group = '54321';
            const sut = await services.deleteGame(testToken, group, game)
        } catch(err) {
            expect(err.name).toEqual('FAIL')
        }
    });

    test('delete an invalid game from a group', async() => {
        const services = default_services;
        try {
            const game = {
                id: '1234567',
                name: 'jogo invalido',
                price: 'gratis',
            };;
            const group = test_data_int.users.membroTeste[12345];
            const sut = await services.deleteGame(testToken, group, game)
        } catch(err) {
            expect(err.name).toEqual('FAIL')
        }
    });

});


describe ('User Related Tests', () => {
    test('get the username of a user without a token', () => {
        const services = default_services;
        try{
            services.getUsername(undefined)
        } catch(err) {
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