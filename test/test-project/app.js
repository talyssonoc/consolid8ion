var path = require('path'),
	_ = require('lodash');

module.exports = function() {

	return function(engine) {
		var express = require('express'),
			Consolid8ion = require('../../lib'),
			templateEngines = require('./template-engines'),
			engineRequires = _.mapValues(templateEngines, function(currentEngine) {
				return currentEngine.lib();
			}),
			i18Options = {
				locales: ['en'],
				defaultLocale: 'en',
				path: path.join(__dirname, '/locales')
			},
			app = express();

		var cons = new Consolid8ion(app, engineRequires, i18Options);

		app.set('views', path.join(__dirname, '/views'));

		app.set('view engine', templateEngines[engine].extension);
		cons.setup(engine, templateEngines[engine].extension);

		app.get('*', function(req, res) {
			res.render('locale-test');
		});

		return app;

	};

};