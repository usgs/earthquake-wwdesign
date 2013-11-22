require.config({
	baseUrl: 'js',
	paths: {
		'mvc': '/hazdev-webutils/src/mvc',
		'util': '/hazdev-webutils/src/util'
	},
	shim: {
	}
});

require([
], function (
) {
	'use strict';
	console.log('Framework Loaded');
});
