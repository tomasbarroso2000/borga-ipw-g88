'use strict';

const res = require('express/lib/response');
const fetch = require('node-fetch');
const request = require('supertest');  // npm install supertest --save-dev

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
        await fetch(`${es_spec.url}${es_spec.prefix}_${config.guest.user}_groups`, // to do
        { method: 'DELETE' }
        );
    });

    test( 'Get nonexisting groups from user', async () => {
        const response = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(404);
        
        expect(response.status).toBe(404); 
    });

    
    test( 'Add group to user', async () => {
        const response = await request(app)
            .put('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
			.expect('Content-Type', 'application/json; charset=utf-8');
			
        expect(response.status).toBe(200);
		expect(response.body).toBeTruthy();
    });


    test( 'Get groups from user', async () => {
        const response = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
			.expect('Content-Type', 'application/json; charset=utf-8');

        expect(response.status).toBe(200); 
        expect(response.body).toBeTruthy();
    });
});