var _ = require('lodash'),
	Consolidate = require('./consolidate');

/**
 * @param {Object} app              Connect/Express/Restify/Express-compliant app
 * @param {Object} consolidateCache Cache for template engines
 * @param {Object} i18nOptions      Options to pass to I18Node
 */
var Consolid8ion = function Consolid8ion(app, consolidateCache, i18nOptions) {
	this.app = app;

	if(i18nOptions) {
		var I18Node = new require('./i18n'),
			i18nodeOptions = _.omit(i18nOptions, ['getLocaleFrom']);

		this.getLocaleFrom = i18nOptions.getLocaleFrom;

		this.i18n = new I18Node(i18nodeOptions);
	}
	else {
		this.i18n = false;
	}

	consolidateCache = consolidateCache || {};

	this.consolidate = Consolidate(consolidateCache);
	this.consolidateCache = consolidateCache;

	//Setups the request middleware to get the locale
	this.app.use(this.middleware());
};

var getLocalizedArguments = function(self, res, argz) {
	var args = Array.prototype.slice.call(argz, 0)

	if(!args[1]) {
		args[1] = { locale: res.locals._locale || self.i18n.getLocale() }
	}
	else {
		if(_.isNumber(args[1])) {
			args[1] = { num: args[1] }
		}

		args[1].locale = args[1].locale || res.locals._locale || self.i18n.getLocale();
	}

	return args;
};

var expressLocal = function() {
	var self = this;

	this.app.use(function(req, res, next) {

		res.locals.i18n = function i18n() {
			var args = getLocalizedArguments(self, res, arguments);
			return self.i18n.i18n.apply(self.i18n, args);
		};

		next();
	});
};

var mustacheHandler = function() {
	var self = this;

	this.app.use(function i18n(req, res, next) {
		res.locals.i18n = function i18n() {
			return function (text, render) {
				var options = {
					locale: res.locals._locale
				};

				return self.i18n.i18n.call(self.i18n, text, options);
			};
		};

		next();
	});
};

Consolid8ion.prototype = {
	setup: function(engine, extension, options) {
		if(typeof this.setupList[engine] === 'function' && this.i18n) {
			this.setupList[engine].call(this, extension, options);
			this.app.engine(extension, this.consolidate[engine]);
		}
		else {
			this.app.engine(extension, this.consolidate[engine]);
		}
	},

	middleware: function() {
		var self = this;

		return function consolid8tionMiddleware(req, res, next) {
			res.locals._locale = self.getLocale(req);

			next();
		}
	},

	getLocale: function(req) {
		switch(this.getLocaleFrom) {
			case 'query':
				return req.query.locale || this.i18n.getLocale();

			case 'cookies':
				return req.cookies.locale || this.i18n.getLocale();

			case 'session':
				return req.session.locale || this.i18n.getLocale();

			case 'subdomain':
				return this.getLocaleFromSubdomain(req);

			case 'header':
				return this.getLocaleFromHeader(req);

			default:
				return this.i18n.getLocale();
		}
	},

	getLocaleFromSubdomain: function(req) {
		var subdomain = req.host.split('.')[0];

		if(this.i18n.hasLocale(subdomain)) {
			return subdomain;
		}

		return this.i18n.getLocale();
	},

	getLocaleFromHeader: function(req) {
		var acceptedLanguages = req.headers['accept-language'] ? req.headers['accept-language'].split(/\s*,\s*/g) : [],
			localeWithoutRegion,
			locale;

		for(var i = 0; i < acceptedLanguages.length; i++) {
			locale = acceptedLanguages[i].toLowerCase();

			locale = locale.split(';')[0];

			if(this.i18n.hasLocale(locale)) {
				return locale;
			}

			localeWithoutRegion = locale.split('-')[0];

			if(this.i18n.hasLocale(localeWithoutRegion)) {
				return localeWithoutRegion;
			}
		}

		return this.i18n.getLocale();
	},

	setupList: {
		eco: expressLocal,

		ejs: expressLocal,

		ect: expressLocal,
		
		haml: expressLocal,

		'haml-coffee': expressLocal,

		jade: expressLocal,

		qejs: expressLocal,

		swig: expressLocal,

		hogan: mustacheHandler,

		mustache: mustacheHandler,
		
		jazz: function() {
			var self = this;

			this.app.use(function(req, res, next) {

				res.locals.i18n = function i18n() {
					var callback = arguments[arguments.length - 1];

					var args = getLocalizedArguments(self, res, Array.prototype.slice.call(arguments, 0, -1));
					callback(self.i18n.i18n.apply(self.i18n, args));
				};

				next();
			});
		},

		handlebars: function() {

			var hbs = this.consolidate.getCache('handlebars'),
				self = this;

			hbs.registerHelper('i18n', function i18n(context, options) {

				options.hash.locale = options.hash.locale || options.data.root._locale;

				return self.i18n.i18n.call(self.i18n, context, options.hash);
			});
		},

		dust: function() {
			var	self = this;
			
			this.app.use(function(req, res, next) {
				res.locals.i18n = function i18n(chunk, context, bodies) {
					return chunk.tap(function(data) {
						var options = {
							locale: res.locals._locale || self.i18n.getLocale()
						}

						return self.i18n.i18n.call(self.i18n, data, options);
					}).render(bodies.block, context).untap();
				};

				next();
			});
		},

		nunjucks: function() {
			var nunjucks = this.consolidate.getCache('nunjucks'),
				self = this;

			nunjucks.i18nExtension = function i18n() {
				this.tags = ['i18n'];

				this.parse = function(parser, nodes, lexer) {
				    // get the tag token
				    var token = parser.nextToken();
				    var args = parser.parseSignature(null, true);
				    parser.advanceAfterBlockEnd(token.value);

				    return new nodes.CallExtension(this, 'run', args);
				};

				this.run = function(context, term, options) {
					var locale = context.ctx._locale;

					options = options || {};
					options.locale = options.locale || locale || self.i18n.getLocale();

				    var ret = new nunjucks.runtime.SafeString(self.i18n.i18n(term, options));
				    return ret;
				};
			};
		}

	}
};

module.exports = Consolid8ion;