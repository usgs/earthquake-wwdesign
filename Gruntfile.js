'use strict';

var LIVE_RELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVE_RELOAD_PORT});
var gateway = require('gateway');

var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;

var mountFolder = function (connect, dir) {
	return connect.static(require('path').resolve(dir));
};

var mountPHP = function (dir, options) {
	options = options || {
		'.php': 'php-cgi',
		'env': {
			'PHPRC': process.cwd() + '/node_modules/hazdev-template/src/conf/php.ini'
		}
	};
	return gateway(require('path').resolve(dir), options);
};

module.exports = function (grunt) {

	// Load grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// App configuration, used throughout
	var appConfig = {
		src: 'src',
		dist: 'dist',
		test: 'test',
		tmp: '.tmp'
	};

	// TODO :: Read this from .bowerrc
	var bowerConfig = {
		directory: 'bower_components'
	};

	grunt.initConfig({
		app: appConfig,
		bower: bowerConfig,
		watch: {
			scripts: {
				files: ['<%= app.src %>/htdocs/js/**/*.js'],
				tasks: ['concurrent:scripts'],
				options: {
					livereload: LIVE_RELOAD_PORT
				}
			},
			scss: {
				files: ['<%= app.src %>/htdocs/css/**/*.scss'],
				tasks: ['compass:dev']
			},
			tests: {
				files: ['<%= app.test %>/*.html', '<%= app.test %>/**/*.js'],
				tasks: ['concurrent:tests']
			},
			livereload: {
				options: {
					livereload: LIVE_RELOAD_PORT
				},
				files: [
					'<%= app.src %>/htdocs/**/*.html',
					'<%= app.src %>/htdocs/css/**/*.css',
					'<%= app.src %>/htdocs/img/**/*.{png,jpg,jpeg,gif}',
					'.tmp/css/**/*.css'
				]
			},
			gruntfile: {
				files: ['Gruntfile.js'],
				tasks: ['jshint:gruntfile']
			}
		},
		concurrent: {
			scripts: ['jshint:scripts', 'mocha_phantomjs'],
			tests: ['jshint:tests', 'mocha_phantomjs'],
			predist: [
				'jshint:scripts',
				'jshint:tests',
				'compass'
			],
			dist: [
				'requirejs:dist',
				'cssmin:dist',
				'copy'
			]
		},
		connect: {
			options: {
				hostname: 'localhost'
			},
			rules: [
				{from:'^/theme/(.*)$', to:'/hazdev-template/src/htdocs/$1'}
			],
			dev: {
				options: {
					base: '<%= app.src %>/htdocs',
					port: 8080,
					components: bowerConfig.directory,
					middleware: function (connect, options) {
						return [
							lrSnippet,
							mountFolder(connect, '.tmp'),
							mountFolder(connect, options.components),
							mountPHP(options.base),
							mountFolder(connect, options.base),
							rewriteRulesSnippet,
							mountFolder(connect, 'node_modules')
						];
					}
				}
			},
			dist: {
				options: {
					base: '<%= app.dist %>/htdocs',
					port: 8081,
					components: bowerConfig.directory,
					middleware: function (connect, options) {
						return [
							mountPHP(options.base),
							mountFolder(connect, options.base),
							rewriteRulesSnippet,
							mountFolder(connect, 'node_modules')
						];
					}
				}
			},
			test: {
				options: {
					base: '<%= app.test %>',
					components: bowerConfig.directory,
					port: 8000,
					middleware: function (connect, options) {
						return [
							mountFolder(connect, '.tmp'),
							mountFolder(connect, 'bower_components'),
							mountFolder(connect, 'node_modules'),
							mountFolder(connect, options.base),
							mountFolder(connect, appConfig.src + '/htdocs/js')
						];
					}
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			gruntfile: ['Gruntfile.js'],
			scripts: ['<%= app.src %>/htdocs/js/**/*.js'],
			tests: ['<%= app.test %>/**/*.js']
		},
		compass: {
			dev: {
				options: {
					sassDir: '<%= app.src %>/htdocs/css',
					cssDir: '<%= app.tmp %>/css',
					environment: 'development'
				}
			}
		},
		mocha_phantomjs: {
			all: {
				options: {
					urls: [
						'http://localhost:<%= connect.test.options.port %>/index.html'
					]
				}
			}
		},
		requirejs: {
			dist: {
				options: {
					//appDir: appConfig.src + '/htdocs',
					baseUrl: appConfig.src + '/htdocs/js',
					//dir: appConfig.dist + '/htdocs',
					out: appConfig.dist + '/htdocs/js/index.js',
					useStrict: true,
					wrap: false,
					paths: {
						'requireLib': '../../../bower_components/requirejs/require',
						'util': '../../../bower_components/hazdev-webutils/src/util',
						'mvc': '../../../bower_components/hazdev-webutils/src/mvc',
						'leaflet': '../../../node_modules/leaflet/dist/leaflet',
						'tablist': '../../../node_modules/hazdev-tablist/src/tablist/TabList'
					},
					name: 'index',
					include: [
						'requireLib'
					],
					optimize: 'uglify2',
					/*
					uglify2: {
						report: 'gzip',
						mangle: true,
						compress: true,
						preserveComments: 'some'
					}
					*/
				}
			}
		},
		cssmin: {
			dist: {
				options: {
					processImport: false
				},
				files: {
					'<%= app.dist %>/htdocs/css/index.css': [
						process.cwd() + '/node_modules/leaflet/dist/leaflet.css',
						'<%= app.src %>/htdocs/css/**/*.css',
						'.tmp/css/**/*.css'
					]
				}
			}
		},
		copy: {
			dist: {
				expand: true,
				cwd: '<%= app.src %>',
				dest: '<%= app.dist %>',
				src: [
					'lib/*',
					'conf',
					'htdocs/_config.inc.php',
					'htdocs/_navigation.inc.php',
					'htdocs/dataminer.php',
					'htdocs/index.php',
					'htdocs/overlays.php',
					'htdocs/ufc.php',
					'htdocs/ufc2json.inc.php',
					'htdocs/xml2json.inc.php',
					'htdocs/images/*'
				]
			},
			leafletimages: {
				expand: true,
				cwd: process.cwd() + '/node_modules/leaflet/dist/images',
				dest: '<%= app.dist %>/htdocs/images',
				src: [
					'*'
				]
			}
		},
		replace: {
			// This is needed to deploy to old template ... sigh ... :(
			templatedowngrade: {
				overwrite: true,
				src: [
					'<%= app.dist %>/htdocs/*.php'
				],
				replacements: [
					{
						from: 'include_once \'template.inc.php\';',
						to: 'include_once $_SERVER[\'DOCUMENT_ROOT\'] . \'/template/template.inc.php\';'
					},
					{
						from: 'include_once \'functions.inc.php\';',
						to: 'include_once $_SERVER[\'DOCUMENT_ROOT\'] . \'/template/static/functions.inc.php\';'
					},
					{
						from: '/* TEMPLATE_DOWNGRADE_FOOT_HACK */',
						to: 'print $FOOT;'
					},
					{
						from: '// print side_nav_',
						to: 'print side_nav_'
					},
					{
						from: 'navItem(',
						to: 'side_nav_item('
					}
				]
			},
			html: {
				overwrite: true,
				src: [
					'<%= app.dist %>/htdocs/*.php',
					'<%= app.dist %>/htdocs/*.html',
				],
				replacements: [
					{
						from: '<script src="http://localhost:35729/livereload.js?snipver=1"></script>',
						to: ''
					},
				]
			},
			css: {
				overwrite: true,
				src: [
					'<%= app.dist %>/htdocs/css/*.css'
				],
				replacements: [
					{from: 'images/layers.png', to: '../images/layers.png'},
					{from: 'images/layers-2x.png', to: '../images/layers-2x.png'},
					{from: '*{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}',
					 to: '#application *{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}'},
					{from: '@import url(../leaflet/dist/leaflet.css);', to: ''}
				]
			}
		},
		file_append: {
			imagepath: {
				files: {
					'dist/htdocs/js/index.js': {
						append: 'L.Icon.Default.imagePath = \'images\';'
					}
				}
			}
		},
		open: {
			dev: {
				path: 'http://localhost:<%= connect.dev.options.port %>'
			},
			test: {
				path: 'http://localhost:<%= connect.test.options.port %>'
			},
			dist: {
				path: 'http://localhost:<%= connect.dist.options.port %>'
			}
		},
		clean: {
			dist: ['<%= app.dist %>'],
			dev: ['<%= app.tmp %>', '.sass-cache']
		}
	});

	grunt.event.on('watch', function (action, filepath) {
		// Only lint the file that actually changed
		grunt.config(['jshint', 'scripts'], filepath);
	});

	grunt.registerTask('test', [
		'clean:dist',
		'connect:test',
		'mocha_phantomjs'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		'concurrent:predist',
		'concurrent:dist',
		'replace',
		'file_append'
		// 'connect:dist:keepalive',
		// 'open:dist',

	]);

	grunt.registerTask('default', [
		'clean:dist',
		'compass:dev',
		'configureRewriteRules',
		'connect:test',
		'connect:dev',
		'open:test',
		'open:dev',
		'watch'
	]);

};
