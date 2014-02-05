require.config({
	baseUrl: 'js',
	paths: {
		'mvc': '/hazdev-webutils/src/mvc',
		'util': '/hazdev-webutils/src/util',
		'leaflet': '/leaflet/dist/leaflet',
		'tablist': '/hazdev-tablist/src/tablist/TabList'
	},
	shim: {
	}
});

require([
	'GlobalDesignApplication'
], function (
	GlobalDesignApplication
) {
	'use strict';

	new GlobalDesignApplication({
		el: document.querySelector('#application')
	});
});
