'use strict';

const default_port = 8888;
const port = process.argv[2] || default_port;

const express = require('express');

const data_ext = require('./board-games-data');
const data_int = require('./borga-data-mem');
const services = require('./borga-services')(data_ext, data_int);
const webapi = require('./borga-web-api')(services);

const app = express();

app.use('/api', webapi);

app.listen(port);
