module.exports = function(grunt) {
  var _ = grunt.util._;
  // Load all of our NPM tasks...
  var languages = ['jade', 'stylus'],
      minifiers = ['uglify'],
      linters   = ['jshint'],
      utilities = ['concat', 'copy', 'clean', 'watch', 'connect'];

  var contribLibs = _.union(languages, minifiers, linters, utilities);
  function prefixLibs(name) {return 'grunt-contrib-' + name;}
  contribLibs = _.map(contribLibs, prefixLibs);

  var thirdPartyLibs = ['grunt-template-helper', 'grunt-markdown'];
  var npmTasks = _.union(contribLibs, thirdPartyLibs);

  _.each(npmTasks, grunt.loadNpmTasks);

  // load our jade locals module
  var jadeLocals = require('./src/markup/helpers/scripts/jade_locals.js')(grunt);

  // load stylus plugins
  var stylusPlugins = [require('fluidity'), require('roots-css')];

  grunt.initConfig({
    // Read build info from --dev or --build="build" command line args.
    build: grunt.option('dev') && 'dev' || grunt.option('build') || 'default',
    // Allow specification from command line of which jade and/or stylus file(s) to compile.
    jadeFilter: _.isString(grunt.option('jadeFilter')) && grunt.option('jadeFilter') || undefined,
    stylusFilter: _.isString(grunt.option('stylusFilter')) && grunt.option('stylusFilter') || undefined,
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      name: '<%= pkg.name %>',
      banner: '/* <%= pkg.name %> - v<%= pkg.version %> - <%= template.today("m/d/yyyy") %> */'
    },
    jshint: {
      options: {
        expr: true
      },
      all: ['gruntfile.js', 'src/scripts/**/*.js', '!src/scripts/vendor/**']
    },
    uglify: {
      options: {
        banner: ['/***************',
            'Compiled <%= pkg.name %> JavaScript',
            'v<%= pkg.version %>',
            '<%= grunt.template.today("mm-dd-yyyy")%>',
            '***************/\n'].join('\n\n'),
        compress: true,
        mangle: true
      },
      main: {
        src: 'src/scripts/lib/main.js',
        dest: 'build/scripts/main.min.js'
      }
    },
    stylus: {
      options:{
        use: stylusPlugins
      },
      compile: {
        files: [{
          expand: true,     // Enable dynamic expansion.
          cwd: 'src/styles/lib',      // Src matches are relative to this path.
          src: ['**/*.styl', '!**/_*'], // Actual pattern(s) to match.
          dest: 'build/styles/stylus/',   // Destination path prefix.
          ext: '.css',   // Dest filepaths will have this extension.
          filter:  function(src){
            var stylusPath = grunt.config('stylusPath');
            return stylusPath ? grunt.file.isMatch(stylusPath, src) : true;
          }
        }]
      }
    },
    jade: {
      options: {
        pretty: true,
        data: _.extend({},jadeLocals, {build: '<%= build %>'})
      },
      compile: {
        files: [{
          expand: true,  // Enable dynamic expansion.
          cwd: 'src/markup/htdocs/',      // Src matches are relative to this path.
          src: '**/*.jade', // Actual pattern(s) to match.
          dest: 'build/markup/jade/',   // Destination path prefix.
          ext: '.html'   // Dest filepaths will have this extension.
        }]
      }
    },
    template: {
      prettyJade: {
        options: {
          minify: {
            pretty: {
              mode: 'beautify',
              lang: 'markup',
              html: 'html-yes'
            }
          }
        },
        files: [{
          expand: true,  // Enable dynamic expansion.
          cwd: 'build/markup/jade/',      // Src matches are relative to this path.
          src: '**/*.html', // Actual pattern(s) to match.
          dest: 'build/markup/prettyhtml/'   // Destination path prefix.
        }]
      }
    },
    copy: {
      vendorScripts: {
        files: [{
          expand: true,
          cwd: 'src/scripts/vendor/',
          src: '**/*',
          dest: 'build/scripts/vendor/'
        }]
      },
      devScripts: {
        files: [{
          expand: true,
          cwd: 'src/scripts/lib',
          src: '**/*.js',
          dest: 'assets/scripts/'
        }]
      },
      scripts: {
        files: [{
          expand: true,
          cwd: 'build/scripts/',
          src: '**/*',
          dest: 'assets/scripts/'
        }]
      },
      vendorStyles: {
        files: [{
          expand: true,
          cwd: 'src/styles/vendor/',
          src: '**/*.css',
          dest: 'build/styles/vendor/'
        }]
      },
      devStyles: {
        files: [{
          expand: true,  // Enable dynamic expansion.
          cwd: 'build/styles/stylus/',      // Src matches are relative to this path.
          src: '**/*.css', // Actual pattern(s) to match.
          dest: 'build/styles/'   // Destination path prefix.
        }]
      },
      styles: {
        files: [{
          expand: true,
          cwd: 'build/styles/',
          src: '**/*',
          dest: 'assets/styles/'
        }]
      },
      markup: {
        files: [{
          expand: true,  // Enable dynamic expansion.
          cwd: 'build/markup/prettyhtml/',      // Src matches are relative to this path.
          src: '**/*.html', // Actual pattern(s) to match.
          dest: '.'   // Destination path prefix.
        }]
      }
    },
    clean: {
      build: ['build'],
      scripts: ['build/scripts'],
      styles: ['build/styles'],
      markup: ['build/markup'],
      genScripts: ['assets/scripts/'],
      genStyles: ['assets/styles/'],
      genMarkup: {
        src: ['**/*.html','!node_modules/**/*'],
        filter: function(filepath) {
          var jadepath = filepath.replace('.html','.jade');
          return grunt.file.exists('src/markup/htdocs/' + jadepath);
        }
      },
      stylus: ['build/styles/stylus'],
      jade: ['build/markup/jade'],
      template: ['build/markup/prettyhtml']
    },
    watch: {
      options: {
        interrupt: false
      },
      scripts: {
        files: ['src/scripts/lib/*.js'],
        tasks: ['scripts']
      },
      styles: {
        files: ['src/styles/**/*.styl'],
        tasks: ['styles']
      },
      markup: {
        files: ['src/markup/**/*{.jade,.js}'],
        tasks: ['markup']
      }
    },
    connect: {
      site: {}
    }
  });
  // END `grunt.initConfig`

  function chainTasks(tasks){
    grunt.task.run(tasks);

    var name = grunt.task.current.name;
    // Clean based on task name.
    if(!_.isString(name)){
      grunt.log.error('No name supplied for cleaning; check grunt configuration.');
      grunt.log.error('Not cleaning intermediate files.');
      return;
    }

    if(!grunt.option('debug'))
        grunt.task.run('clean:'+name);
    else // redundant `else` as `grunt.log.debug` only logs with debug option specified
      grunt.log.debug('Not cleaning intermediate '+name+'.');

  }

  grunt.registerTask('scripts', 'Concatenate and minify Javascript files.', function(){
    chainTasks(['copy:vendorScripts', 'uglify:main', 'copy:devScripts', 'copy:scripts']);
  });

  grunt.registerTask('styles', 'Compile Stylus to CSS & minify.', function(){
    chainTasks(['copy:vendorStyles', 'stylus:compile', 'copy:devStyles', 'clean:stylus', 'copy:styles']);
  });
  grunt.registerTask('markup', 'Compile Jade to HTML & beautify.', function() {
    // `grunt markup:dev` == `grunt markup --dev` == `grunt markup --build=dev`
    if(this.flags.dev){
      grunt.config('build','dev');
      grunt.log.error('Development build; including unminified scripts.');
    }

    chainTasks(['jade:compile', 'template:prettyJade', 'copy:markup']);

  });

  function cleanBuild (target){
    return 'clean:'+target;
  }

  function cleanGen (target){
    return 'clean:gen'+_.capitalize(target);
  }

  var mainTasks = ['scripts', 'styles', 'markup'];

  /*
  No longer necessary with build directory.
  grunt.registerTask('clean:build',
    'Remove / clean all intermediate build files.',
    _.map(mainTasks, cleanBuild)
  );
  */

  grunt.registerTask('clean:gen',
    'Remove / clean all final generated files.',
    _.map(mainTasks, cleanGen)
  );

  grunt.registerTask('default', "Grunt.", function() {
    grunt.task.run(mainTasks);
    if(!grunt.option('no-watch')) grunt.task.run('watch');
  });

};
