'use strict';

const mem = require('../borga-data-mem');
const testToken = '1365834658346586';


describe('Group Related Tests', () => {
    /*
    test('create a group with an invalid token', async() => {
        try{
            const sut = await mem.createGroup(testToken, undefined, 'groupDesc');
        } catch(err) {
            expect(err.name).toEqual('MISSING_PARAM');
        }
    });
    */

    test('create a group with an invalid groupName', async() => {
        try{
            const sut = await mem.createGroup('membroTeste', undefined, 'groupDesc');
        } catch(err) {
            expect(err.name).toEqual('MISSING_PARAM');
        }
    });

    test('get groups of a nonexisting user', async() => {
        try{
            const sut = await mem.getGroups('123456789');
        } catch(err) {
            expect(err.name).toEqual('NOT_FOUND');
        }
    });

    test('get groups from an existing user', async() => {
            const expectedGroup = mem.users.membroTeste
            const sut = await mem.getGroups("membroTeste");
            expect(sut).toEqual(expectedGroup);
    });
});