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

    /*
    afterAll(async () => {
        const response = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
			.expect('Content-Type', 'application/json; charset=utf-8');
        Object.keys(response.body).forEach(
            await request(app).delete('api/my/groups/'+this)
        );
    });
    */

    test( 'Get nonexisting groups from user', async () => {
        const response = await request(app)
            .get('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
        
        expect(response.status).toBe(200); 
    });

    
    test( 'Add group to user', async () => {
        const response = await request(app)
            .put('/api/my/groups')
            .set('Authorization', `Bearer ${config.guest.token}`)
            .set('Accept', 'application/json')
            .set('body', {
                "name": "NewGroup",
                "description": "Description of NewGroup"
            })
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
        expect(Object.keys(response.body)).toHaveLength(0)
    });
});