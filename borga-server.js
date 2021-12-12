'use strict';

const default_port = 8888;
const port = process.argv[2] || default_port;

const guest_user  = 'guest';
const guest_token = '1365834658346586';

const express = require('express');

const data_ext = require('./board-games-data');
const data_int = require('./borga-data-mem');
const services = require('./borga-services')(data_ext, data_int);
const webapi = require('./borga-web-api')(services);
const webui = require('./borga-web-site')(services, guest_token);

const app = express();

app.set('view engine', 'hbs');

app.use('/favicon.ico',
	express.static('static-files/favicon.ico'));

app.use('/public', express.static('static-files'));

app.use('/api', webapi);

app.use('/', webui);

app.listen(port);
