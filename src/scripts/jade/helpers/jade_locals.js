var _ = require('lodash/dist/lodash.underscore');
//
module.exports = function(grunt) {
	// Grunt loaded for utilities; do not configure here. 
	// Reading from configuration may not work either,
	// unless done at task runtime.
	var jadeLocals = {};
	jadeLocals.scriptLoader = function() {
		return grunt.file.read('src/markup/includes/scripts/yepnope.js');
	};

	return jadeLocals;
};