module.exports = function(grunt) {
	// Grunt loaded for utilities; do not configure here. 
	// Reading from configuration may not work either,
	// unless done at task runtime; e.g. in a function.
	var _ = grunt.util._;

	var jadeLocals = {};

	jadeLocals.includeJs = function(name) {
		if(!_.isString(name) || !name) {
			grunt.log.error('No script name included.');
			return;
		}

		function wrapScript(js){
			js = _.isString(js) && js || '';
			return ['<script type="text/javascript">',js,'</script>'].join('\n');
		}

		var build = grunt.config('build'),
			piece = (_.isString(build) && build != 'default') ? '.'+build : '';

		var baseDir    = 'src/markup/includes/scripts/',
			scriptPath = [baseDir, name, piece, '.js'].join(''),
			script     = grunt.file.read(scriptPath); // will fail task on error

		return wrapScript(script);
	};

	jadeLocals.includeMarkdown = function(){
		return grunt.file.read(grunt.config('markdownPath'));
	};

	return jadeLocals;
};