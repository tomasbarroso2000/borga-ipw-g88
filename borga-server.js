'use strict';

module.exports = function (es_spec, guest) {
	const data_ext = require('./board-games-data');
	//const data_int = require('./borga-data-mem');
	const data_int = require('./borga-db')(es_spec, guest);
	const services = require('./borga-services')(data_ext, data_int);
	const webapi = require('./borga-web-api')(services);
	const webui = require('./borga-web-site')(services, guest.token);

	const express = require('express');
	const app = express();

	app.set('view engine', 'hbs');

	app.use('/favicon.ico',
		express.static('static-files/favicon.ico'));

	app.use('/public', express.static('static-files'));

	app.use('/api', webapi);

	app.use('/', webui);

	return app;
}