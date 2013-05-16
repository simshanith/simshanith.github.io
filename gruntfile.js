var querystring = require('querystring');

module.exports = function(grunt) {
  var _ = grunt.util._;
  // Load all of our NPM tasks...
  var languages = ['jade', 'stylus', 'coffee'],
      minifiers = ['uglify'],
      linters   = ['jshint'],
      testing   = ['jasmine'],
      utilities = ['concat', 'copy', 'clean', 'watch', 'connect'];

  var contribLibs = _.union(languages, minifiers, linters, testing, utilities);
  function prefixLibs(name) {return 'grunt-contrib-' + name;}
  contribLibs = _.map(contribLibs, prefixLibs);

  var thirdPartyLibs = ['grunt-template-helper', 'grunt-markdown', 'grunt-bg-shell','grunt-cafe-mocha'];
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
    pygments: {
      src: 'src/markup/htdocs/index.jade',
      dest: 'docs/highlighted.html'
    },
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      name: '<%= pkg.name %>',
      banner: '/* <%= pkg.name %> - v<%= pkg.version %> - <%= template.today("m/d/yyyy") %> */'
    },
    concat: {
      pygments: {
        src: ['build/source-code/**/*.html'],
        dest: 'docs/source-code/index.html',
        options: {
          process: function(src, filepath){
            var sourcePath = filepath.slice(0,-5).replace('build/source-code', 'src');
            var repoPath = 'https://github.com/simshanith/simshanith.github.io/tree/master/';
            var gitHubLink = ['<a href="',repoPath,sourcePath,'">',sourcePath,'</a>'].join('');
            var fileHeader = ['<h3><pre>', gitHubLink, '</pre></h3>'].join('');
            return fileHeader+src;
          },
          banner: '<!DOCTYPE html><html><head><style>\
.highlight{background-color:#073642;color:#93a1a1}.highlight .c{color:#586e75 !important;font-style:italic !important}.highlight .cm{color:#586e75 !important;font-style:italic !important}.highlight .cp{color:#586e75 !important;font-style:italic !important}.highlight .c1{color:#586e75 !important;font-style:italic !important}.highlight .cs{color:#586e75 !important;font-weight:bold !important;font-style:italic !important}.highlight .err{color:#dc322f !important;background:none !important}.highlight .k{color:#cb4b16 !important}.highlight .o{color:#93a1a1 !important;font-weight:bold !important}.highlight .p{color:#93a1a1 !important}.highlight .ow{color:#2aa198 !important;font-weight:bold !important}.highlight .gd{color:#93a1a1 !important;background-color:#372c34 !important;display:inline-block}.highlight .gd .x{color:#93a1a1 !important;background-color:#4d2d33 !important;display:inline-block}.highlight .ge{color:#93a1a1 !important;font-style:italic !important}.highlight .gr{color:#aa0000}.highlight .gh{color:#586e75 !important}.highlight .gi{color:#93a1a1 !important;background-color:#1a412b !important;display:inline-block}.highlight .gi .x{color:#93a1a1 !important;background-color:#355720 !important;display:inline-block}.highlight .go{color:#888888}.highlight .gp{color:#555555}.highlight .gs{color:#93a1a1 !important;font-weight:bold !important}.highlight .gu{color:#6c71c4 !important}.highlight .gt{color:#aa0000}.highlight .kc{color:#859900 !important;font-weight:bold !important}.highlight .kd{color:#268bd2 !important}.highlight .kp{color:#cb4b16 !important;font-weight:bold !important}.highlight .kr{color:#d33682 !important;font-weight:bold !important}.highlight .kt{color:#2aa198 !important}.highlight .n{color:#268bd2 !important}.highlight .na{color:#268bd2 !important}.highlight .nb{color:#859900 !important}.highlight .nc{color:#d33682 !important}.highlight .no{color:#b58900 !important}.highlight .ni{color:#800080}.highlight .nl{color:#859900 !important}.highlight .ne{color:#268bd2 !important;font-weight:bold !important}.highlight .nf{color:#268bd2 !important;font-weight:bold !important}.highlight .nn{color:#b58900 !important}.highlight .nt{color:#268bd2 !important;font-weight:bold !important}.highlight .nx{color:#b58900 !important}.highlight .bp{color:#999999}.highlight .vc{color:#008080}.highlight .vg{color:#268bd2 !important}.highlight .vi{color:#268bd2 !important}.highlight .nv{color:#268bd2 !important}.highlight .w{color:#bbbbbb}.highlight .mf{color:#2aa198 !important}.highlight .m{color:#2aa198 !important}.highlight .mh{color:#2aa198 !important}.highlight .mi{color:#2aa198 !important}.highlight .mo{color:#009999}.highlight .s{color:#2aa198 !important}.highlight .sb{color:#d14}.highlight .sc{color:#d14}.highlight .sd{color:#2aa198 !important}.highlight .s2{color:#2aa198 !important}.highlight .se{color:#dc322f !important}.highlight .sh{color:#d14}.highlight .si{color:#268bd2 !important}.highlight .sx{color:#d14}.highlight .sr{color:#2aa198 !important}.highlight .s1{color:#2aa198 !important}.highlight .ss{color:#990073}.highlight .il{color:#009999}.highlight div .gd,.highlight div .gd .x,.highlight div .gi,.highlight div .gi .x{display:inline-block;width:100%}\
</style></head><body>',
          footer: '</body></html>'
        }
      }
    },
    coffee: {
      options: {

      },
      tests: {
        files: [{
          expand: true,
          cwd: 'test/',
          src: '{jasmine,mocha}/**/*.coffee',
          dest: 'test/',
          ext: '.js'
        }]
      }
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
    bgShell: {
      _defaults: {
        bg: false
      },
      pygmentize: {
        cmd: 'pygmentize -f html -o <%= pygments.dest %> <%= pygments.src %>'
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
      template: ['build/markup/prettyhtml'],
      test: {
        src: ['test/{jasmine,mocha}/**/*.js'],
        filter: function(filepath){
          var coffeepath = filepath.replace('.js','.coffee');
          return grunt.file.exists(coffeepath);
        }
      },
      pygments: ['build/source-code/'],
      genPygments: ['docs/source-code/']
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
      },
      mochaTest: {
        files: ['gruntfile.js', 'src/scripts/jade/helpers/jade_locals.js','test/{jasmine,mocha}/**/*.coffee'],
        tasks: ['test']
      },
      pygments: {
        files: ['src/{markup,scripts}/**/*.{jade,js}', '!**/vendor/*'],
        tasks: ['pygmentize']
      }
    },
    connect: {
      site: {}
    },
    jasmine: {

    },
    cafemocha: {
      options: {
        reporter: 'spec',
        growl: true,
        compilers: 'coffee-script'
      },
      test: 'test/mocha/spec.js'
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

    if(!grunt.option('debug') && !grunt.option('no-clean'))
        grunt.task.run('clean:'+name);
    else // redundant `else` as `grunt.log.debug` only logs with debug option specified
        grunt.log.subhead('Not cleaning intermediate '+name+'.');

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

  grunt.registerTask('test', 'Build and run tests.',function(){
    grunt.log.subhead('TESTING');
    chainTasks(['coffee:tests', 'cafemocha:test']);
  });

  function cleanBuild (target){
    return 'clean:'+target;
  }

  function cleanGen (target){
    return 'clean:gen'+_.capitalize(target);
  }

  var mainTasks = ['scripts', 'styles', 'markup', 'test'];

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

  grunt.registerTask('_pyg', 'internal grunt config', function(pairStr){
    var pair = querystring.parse(pairStr);
    // Create file & intermediate directories.
    grunt.file.write(pair.dest, 'Running pygments...');
    grunt.config('pygments', pair);
  });

  grunt.registerTask('pygmentize', 'Generate HTML of syntax-highlighted source code.', function(){
   
    var expandOpts  = {cwd: 'src/', flatten: false, rename: pygRename},
        sourceFiles = ['{markup,scripts}/**/*.{jade,js}', '!**/vendor/*', '!markup/**/*.js'],
        targetDir   = 'build/source-code/',
        fileMatches = grunt.file.expandMapping(sourceFiles, targetDir, expandOpts);

    function pygRename(dest, matchedSrcPath, options) {
      return dest + matchedSrcPath + '.html';
    }

    grunt.log.subhead('Found '+fileMatches.length+' source files to highlight.');

    _.each(fileMatches, function(pair, i, arr){
      var pairStr = querystring.stringify(pair);
      grunt.task.run(['_pyg:'+pairStr,'bgShell:pygmentize']);
    });

    grunt.task.run(['concat:pygments', 'clean:pygments']);
  });

};