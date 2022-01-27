'use strict';

const express = require('express');
const session = require('express-session');
const passport = require('passport');

passport.serializeUser((userInfo, done) => { done(null, userInfo); });
passport.deserializeUser((userInfo, done) => { done(null, userInfo); });

module.exports = function (es_spec, guest) {
	const data_ext = require('./board-games-data');
	const data_int = require('./borga-data-mem');
	//const data_int = require('./borga-db')(es_spec, guest);
	const services = require('./borga-services')(data_ext, data_int);
	const webapi = require('./borga-web-api')(services);
	const webui = require('./borga-web-site')(services, guest.token);


	
	const app = express();

	app.use(session({
		secret: 'exploding-kittens',
		resave: false,
		saveUninitialized: false
	}));

	app.set('view engine', 'hbs');

	app.use(passport.initialize());
	app.use(passport.session());
	app.use('/favicon.ico',	express.static('static-files/favicon.ico'));
	app.use('/public', express.static('static-files'));
	app.use('/api', webapi);
	app.use('/', webui);

	return app;
}