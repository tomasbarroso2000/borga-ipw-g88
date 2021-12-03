'use strict';

const errorList = require('../borga-responseCodes');

const service_builder = require('../borga-services.js');

const mock_data_ext = require('borga-games-data');

const test_data_int = require('../borga-data-mem');

const tokens = {
    '4chwViN4QHCTyTnUud88ww' : 'Tom Holland'
}

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

    test('search nonexisting game', async () => {
        const services = default_services;
        try{
            await services.searchGame('Alex+o+Leao');
        } catch(err) {
            expect(err.name).toEqual('NOT_FOUND')
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
/*
    test('get the username of a user using the token', async () => {
        const services = default_services;
        const username = await services.getUsername('1365834658346586');
        expect(username).toEqual('membroTeste');
    });
*/
});