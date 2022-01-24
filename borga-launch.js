'use strict'

const default_port = 8888;
const port = process.env["PORT"] || default_port;

const config = require('./borga-config');

const es_spec = {
	url: process.env["BONSAI_URL"] || config.devl_es_url,
	prefix: 'prod'
};

const app = require('./borga-server')(es_spec, config.guest);

app.listen(port);