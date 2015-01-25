// Generated on 2014-08-02 using generator-angular 0.9.2
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({
    // https://www.npmjs.org/package/grunt-gh-pages
    'gh-pages': {
      // no-args/default is staging deployment. 'grunt gh-pages:prod' for production.
      options: {
        base: 'dist'
      },
      src: ['**'],
      staging: {
        // default options
        options: {},
        src: ['**']
      },
      publictest: {
        options: {
          branch: 'master',
          repo: 'git@github.com:swarmsim-publictest/swarmsim-publictest.github.io.git'
        },
        src: ['**']
      },
      prod: {
        options: {
          branch: 'master',
          repo: 'git@github.com:swarmsim/swarmsim.github.io.git'
        },
        src: ['**']
      }
    },

    // http://hounddog.github.io/blog/using-environment-configuration-with-grunt/
    ngconstant: {
      options: {
        dest: '.tmp/scripts/env.js',
        wrap: '"use strict";\n\n{%= __ngModule %}',
        name: 'swarmEnv',
        constants: {
          version: grunt.file.readJSON('package.json').version
        },
        space: '  '
      },
      test: {
        constants: {
          env: {
            name: 'test',
            isDebugEnabled: true,
            isDebugLogged: false,
            httpsAllowInsecure: true,
            showSkipped: false,
            spreadsheetKey: 'v0.2',
            saveId: '0',
            gaTrackingID: null
          }
        }
      },
      dev: {
        constants: {
          env: {
            name: 'dev',
            isDebugEnabled: true,
            isDebugLogged: true,
            httpsAllowInsecure: true,
            showSkipped: true,
            spreadsheetKey: 'v0.2',
            saveId: 'publictest9',
            gaTrackingID: 'UA-53523462-3'
          }
        }
      },
      prod: {
        constants: {
          env: {
            name: 'prod',
            isDebugEnabled: false,
            isDebugLogged: false,
            httpsAllowInsecure: false,
            //gaTrackingID: 'UA-53523462-2'
            showSkipped: false,
            spreadsheetKey: 'v0.2',
            saveId: 'publictest9',
            gaTrackingID: 'UA-53523462-1'
          }
        }
      },
    },

    preloadSpreadsheet: {
      'v0.2': 'https://docs.google.com/spreadsheets/d/1ughCy983eK-SPIcDYPsjOitVZzY10WdI2MGGrmxzxF4/pubhtml',
      'v0.1': 'https://docs.google.com/spreadsheets/d/1FgPdB1RzwCvK_gvfFuf0SU9dWJbAmYtewF8A-4SEIZM/pubhtml'
    },

    ngtemplates: {
      dist: {
        cwd: 'app',
        // ** not working for some reason
        src: ['views/**.html', 'views/desc/unit/**.html', 'views/desc/upgrade/**.html'],
        dest: '.tmp/scripts/app.templates.js',
        options: {
          module: 'swarmApp',
          htmlmin: '<%= htmlmin.dist.options %>'
        }
      },
      // no templates for dev, so they reload properly when changed
      dev: {
        cwd: 'app',
        src: '/dev/null',
        dest: '.tmp/scripts/app.templates.js',
      },
      options: {
        module: 'swarmApp',
        htmlmin: '<%= htmlmin.dist.options %>'
      }
    },

    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      coffee: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.{coffee,litcoffee,coffee.md}'],
        tasks: ['newer:coffee:dist']
      },
      coffeeTest: {
        files: ['test/spec/{,*/}*.{coffee,litcoffee,coffee.md}'],
        tasks: ['newer:coffee:test', 'karma']
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '.tmp/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        //livereload: 55728  // ngrok won't bind remote ports below 50000
        livereload: 35728 
      },
      livereload: {
        options: {
          //open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          //open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      spreadsheetpreload: 'app/scripts/spreadsheetpreload',
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      options: {
        //cwd: '<%= yeoman.app %>'
      },
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        overrides: {
          'lz-string': {
            main: 'libs/lz-string.js'
          },
          'konami-js': {
            main: 'konami.js'
          }
        },
        ignorePath:  /\.\.\//
      },
      sass: {
        src: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      }
    },

    // Compiles CoffeeScript to JavaScript
    coffee: {
      options: {
        sourceMap: true,
        sourceRoot: ''
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/scripts',
          src: '{,*/}*.coffee',
          dest: '.tmp/scripts',
          ext: '.js'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test/spec',
          src: '{,*/}*.coffee',
          dest: '.tmp/spec',
          ext: '.js'
        }]
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: '<%= yeoman.app %>/styles/fonts',
        importPath: './bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= yeoman.dist %>/scripts/{,*/}*.js',
          '<%= yeoman.dist %>/styles/{,*/}*.css',
          '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.dist %>/styles/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>','<%= yeoman.dist %>/images']
      }
    },

    // The following *-min tasks will produce minified files in the dist folder
    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/scripts/scripts.js': [
    //         '<%= yeoman.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'views/{,*/}*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // ngmin tries to make the code safe for minification automatically by
    // using the Angular long form for dependency injection. It doesn't work on
    // things like resolve or inject so those have to be done manually.
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            'archive/**/*',
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            '*.svg',
            'views/{,*/}*.html',
            'images/{,*/}*.{webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: '.',
          src: 'bower_components/bootstrap-sass-official/vendor/assets/fonts/bootstrap/*',
          dest: '<%= yeoman.dist %>'
        }]
      },
      phonegap: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: '*.xml'
        }, {
          dest: '<%= yeoman.dist %>/icon.png',
          src: '<%= yeoman.app %>/images/swarmsim-icon.png'
        }, {
          dest: '<%= yeoman.dist %>/splash.png',
          src: '<%= yeoman.app %>/images/swarmsim-icon.png'
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'coffee:dist',
        'compass:server'
      ],
      test: [
        'coffee',
        'compass'
      ],
      dist: [
        'coffee',
        'compass:dist',
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.coffee',
        singleRun: true
      }
    }
  });

  // One of few swarmapp-specific tasks
  grunt.registerMultiTask('preloadSpreadsheet', 'Update spreadsheet data', function () {
    var Tabletop = require('tabletop');
    var stringify = require('json-stable-stringify');
    var _ = require('lodash');

    var directory = 'app/scripts/spreadsheetpreload/';
    var url = this.data;
    var key = this.target;
    
    var done = this.async();
    Tabletop.init({
      key: url,
      parseNumbers: true,
      debug: true,
      callback: function (data) {
        data = _.pick(data, ['unittypes', 'upgrades', 'achievements', 'tutorial']);
        data = _.mapValues(data, function(sheet) {
          return _.omit(sheet, ['raw']);
        });

        //var text = JSON.stringify(data, null, 2);
        // built-in stringify puts sheets in a random order. Use a consistent
        // order with json-stable-stringify for cleaner diffs.
        var text = stringify(data, {space:'  '});
        text = '// This is an automatically generated file! Do not edit!\n// Edit the source at: '+url+'\n// Generated by Gruntfile.js:preloadSpreadsheet\n// key: '+key+'\n\'use strict\';\n\ntry {\n  angular.module(\'swarmSpreadsheetPreload\');\n  //console.log(\'second'+key+'\');\n}\ncatch (e) {\n  // module not yet initialized by some other module, we\'re the first\n  angular.module(\'swarmSpreadsheetPreload\', []);\n  //console.log(\'first'+key+'\');\n}\nangular.module(\'swarmSpreadsheetPreload\').value(\'spreadsheetPreload-'+key+'\', '+text+');';
        var filename = directory + key + '.js';
        grunt.file.write(filename, text);
        console.log('Wrote '+filename);
        done();
      }
    });
  });
  grunt.registerTask('writeVersionJson', 'write version info to a json file', function() {
    var version = grunt.file.readJSON('package.json').version;
    var data = {version:version, updated:new Date()};
    var text = JSON.stringify(data, undefined, 2);
    grunt.file.write('.tmp/version.json', text);
    grunt.file.write('dist/version.json', text);
  });
  grunt.registerTask('ss', 'Preload spreadsheet data and save to .tmp', function () {
    grunt.task.run(['preloadSpreadsheet']);
  });

  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }
    if (target === 'prod') {
      grunt.task.run([
        'clean:server',
        'preloadSpreadsheet',
        'ngconstant:prod','writeVersionJson', 'ngtemplates:dist',
        'wiredep',
        'concurrent:server',
        'autoprefixer',
        'connect:livereload',
        'watch'
      ]);
    }

    grunt.task.run([
      'clean:server',
      'preloadSpreadsheet',
      'ngconstant:dev','writeVersionJson', 'ngtemplates:dev',
      'wiredep',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('test', [
    'clean:server',
    //'preloadSpreadsheet',
    'ngconstant:test','writeVersionJson', 'ngtemplates:dev',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    // remove spreadsheets and fetch only the prod spreadsheet, to avoid packaging dev data in prod. smaller file size/faster download.
    'clean:spreadsheetpreload',
    'preloadSpreadsheet:v0.2', // this must match ngconstant.prod.spreadsheetKey
    'ngconstant:prod','writeVersionJson', 'ngtemplates:dist',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'preloadSpreadsheet'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

  grunt.registerTask('deploy-staging', [
    'build',
    'gh-pages:staging'
  ]);
  grunt.registerTask('deploy-publictest', [
    'build',
    'gh-pages:publictest'
  ]);
  grunt.registerTask('phonegap-staging', [
    'build',
    'copy:phonegap',
    'gh-pages:staging'
  ]);
  grunt.registerTask('deploy-prod', [
    'build',
    'gh-pages:prod'
  ]);
};
