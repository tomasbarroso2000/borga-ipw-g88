'use strict';

const fetch = require('node-fetch');
const request = require('supertest');

const config = require('../borga-config.js');
const server = require('../borga-server.js');

const es_spec = {
    url: config.devl_es_url,
    prefix: 'test'
};

test('Confirm database is running', async () => {
    const response = await fetch(`${es_spec.url}_cat/health`); //cat health lists the status of the cluster
    expect(response.status).toBe(200);
});


describe('Integration Tests', () => {

    const app = server(es_spec, config.guest);

    afterAll(async () => {
        const response = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8');
        Object.keys(response.body).forEach(async (elem) => {
            await request(app)
                .delete('/api/my/groups/' + elem)
                .set('Authorization', `Bearer ${config.guest.token}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8');
        });
    });


    test('Search in global games', async () => {
        const response = await request(app)
            .get('/api/global/games')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')

        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
    });

    test('Get game info', async () => {
        const response = await request(app)
            .get('/api/global/games/TAAifFP590')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')

        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
    });

    test('Get nonexisting groups from user', async () => {
        const response = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')

        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
    });

    test('Add group to user', async () => {
        const response = await request(app)
            .post('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .send({ name: 'TestGroup', description: 'Description of TestGroup' })
            .expect('Content-Type', 'application/json; charset=utf-8')


        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
    });

    test('Get groups from user', async () => {
        const response = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8');

        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
        expect(Object.keys(response.body)).toHaveLength(1)
    });

    test('Get groups from nonexisting user', async () => {
        const response = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer alexandre_alemao`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8');

        expect(response.status).toBe(404);
        expect(response.body).toBeTruthy();
    });

    test('Add game to group', async () => {
        const get = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8');
        const groupId = Object.keys(get.body)[0];

        const response = await request(app)
            .post('/api/my/groups/' + groupId + '/TAAifFP590')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')


        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
    });

    test('Add game to nonexisting group', async () => {
        const response = await request(app)
            .post('/api/my/groups/groupId/TAAifFP590')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')


        expect(response.status).toBe(404);
        expect(response.body).toBeTruthy();
    });

    test('Add already existing game to group', async () => {
        const get = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8');
        const groupId = Object.keys(get.body)[0];

        const response = await request(app)
            .post('/api/my/groups/' + groupId + '/TAAifFP590')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')


        expect(response.status).toBe(400);
        expect(response.body).toBeTruthy();
    });

    test('Edit group info from user', async () => {
        const get = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8');
        const groupId = Object.keys(get.body)[0];

        const response = await request(app)
            .put('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .send({ id: `${groupId}` })
            .send({ name: 'EditTestGroup', description: 'Edit Description of TestGroup' })
            .expect('Content-Type', 'application/json; charset=utf-8')

        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
    });

    test('Create a group with a name of an already existing group', async () => {
        const response = await request(app)
            .post('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .send({ name: 'EditTestGroup', description: 'Edit Description of TestGroup' })
            .expect('Content-Type', 'application/json; charset=utf-8')

        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();

        const get = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8');

        expect(get.status).toBe(200);
        expect(Object.keys(get.body)).toHaveLength(2);
    });

    test('Delete game from group', async () => {
        const get = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8');
        const groupId = Object.keys(get.body)[0];

        const response = await request(app)
            .delete('/api/my/groups/' + groupId + '/TAAifFP590')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')


        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
    });

    test('Delete group from user', async () => {
        const get = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8');
        const groupId = Object.keys(get.body)[0];

        const response = await request(app)
            .delete('/api/my/groups/' + groupId)
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8');

        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
    });

    test('Delete nonexisting group from user', async () => {
        const response = await request(app)
            .delete('/api/my/groups/12345678')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8');

        expect(response.status).toBe(404);
        expect(response.body).toBeTruthy();
    });

});
