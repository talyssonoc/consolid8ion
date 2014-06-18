'use strict';

var chai = require('chai'),
	supertest = require('supertest');

chai.expect();
chai.should();

var expect = chai.expect,
	enginesWithLinebreak = [
		'haml',
		'haml-coffee'
	],
	enginesWithoutLinebreak = [
		'dust',
		'eco',
		'ect',
		'ejs',
		'handlebars',
		'hogan',
		'jade',
		'jazz',
		'mustache',
		'nunjucks',
		'qejs',
		'swig'
	],
	port = 4242,
	generateServer = require('./test-project/app');

var generateTest = function(engine, lineBreak) {
	return function(done) {
		var app = generateServer()(engine);

		app.listen(port++);

		supertest(app)
		.get('/')
		.expect(200)
		.end(function(err, res) {
			if(lineBreak) {
				expect(res.text).to.be.eql('<span>Hello</span>\n<span>World</span>');
			}
			else {
				expect(res.text).to.be.eql('<span>Hello</span><span>World</span>');
			}
			done();  
		});
	};
};

for(var i = 0; i < enginesWithoutLinebreak.length; i++) {
	var engine = enginesWithoutLinebreak[i];

	describe('Consolid8ion test with ' + engine, function() {
	
			it('Should have the right content with ' + engine, generateTest(engine, false));

	});
}

for(var i = 0; i < enginesWithLinebreak.length; i++) {
	var engine = enginesWithLinebreak[i];

	describe('Consolid8ion test with ' + engine, function() {
	
			it('Should have the right content with ' + engine, generateTest(engine, true));

	});
}