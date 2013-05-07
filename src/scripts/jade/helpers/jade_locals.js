module.exports = function(grunt) {
	// Grunt loaded for utilities; do not configure here. 
	// Reading from configuration may not work either,
	// unless done at task runtime; e.g. in a function.
	var _ = grunt.util._;

	var jadeLocals = {};
	jadeLocals.scriptLoader = function() {
		var build = grunt.config('build'),
			piece = (_.isString(build) && build == 'dev') ? '.'+build : '';
		return grunt.file.read('src/markup/includes/scripts/yepnope'+piece+'.js');
	};

	return jadeLocals;
};