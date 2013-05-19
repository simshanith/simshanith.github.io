var marked = require('marked');

module.exports = function(grunt) {
	// Grunt loaded for utilities; do not configure here. 
	// Reading from configuration may not work either,
	// unless done at task runtime; e.g. in a function.
	var _ = grunt.util._;

	var jadeLocals = {};

	// Expose grunt config & _ to Jade.
	jadeLocals.grunt = {};
	jadeLocals.grunt.config = grunt.config;
	jadeLocals._ = _



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

	jadeLocals.includeMarkdown = function(markdownPath) {
		marked.setOptions({smartLists: true});

		markdownPath = markdownPath || grunt.config('markdownPath');

		var src  = markdownPath && grunt.file.read(markdownPath),
			output = src && marked(src);

		return output || '';
	};

	grunt.log.writeln(_.keys('jadeLocals').join(', '));

	return jadeLocals;
};