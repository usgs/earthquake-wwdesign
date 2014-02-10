/* global define */
define([
	'util/Util',
	'util/Xhr',
	'leaflet',
	'tablist'
], function (
	Util,
	Xhr,
	L,
	TabList
) {
	'use strict';

	var DEFAULTS = {
		serviceUrl: 'ufc.php',
		icon: new L.Icon({
			iconUrl: 'images/ufc-large.png',
			iconSize: [9, 18],
			iconAncor: [3, 17],
			poupAncor: [4, -100]
		})
	};

	var UfcLayer = function (options) {

		options = Util.extend({}, DEFAULTS, options || {});

		this._layerGroup = new L.LayerGroup();
		this._serviceUrl = options.serviceUrl;
		this._icon = options.icon;

		this._initialize();
	};


	UfcLayer.prototype._initialize = function () {
		var _this = this;

		Xhr.ajax({
			url: this._serviceUrl,
			success: function (response) {
				_this._onSuccess(response);
			},
			error: function (error) {
				_this._onError(error);
			}
		});
	};

	UfcLayer.prototype._onSuccess = function (response) {
		var i, numResults = response.features.length;

		this._datasets = response.datasets;

		for (i = 0; i < numResults; i++) {
			this._layerGroup.addLayer(this._createMarker(response.features[i]));
		}
	};

	UfcLayer.prototype._onError = function (/*error*/) {
		// TODO
	};

	UfcLayer.prototype._createMarker = function (feature) {
		var coordinates = feature.geometry.coordinates,
		    datasets = feature.properties.datasets,
		    i = 0, numDatasets = datasets.length, dataset = null, tabList = null;

		var marker = new L.Marker([coordinates[1], coordinates[0]], {
			icon: this._icon
		});

		if (numDatasets === 1) {
			// No need for tabs
			dataset = this._datasets[datasets[i].dataset];
			marker.bindPopup(this._createTabContent(dataset, datasets[0],
					coordinates));
		} else {
			tabList = new TabList({tabPosition: 'top'});

			for (i = 0; i < numDatasets; i++) {
				dataset = this._datasets[datasets[i].dataset];
				tabList.addTab({
					title: this._createTabTitle(dataset),
					content: this._createTabContent(dataset, datasets[i], coordinates)
				});
			}

			tabList.el.classList.add('global-results');
			marker.bindPopup(tabList.el);
		}

		return marker;
	};

	UfcLayer.prototype._createTabTitle = function (dataset) {
		return dataset.shorttitle;
	};

	UfcLayer.prototype._createTabContent = function (meta, props, coords) {
		var title = meta.title;

		if (meta.link !== '') {
			title = '<a href="' + meta.link + '" target="_blank">' +
					meta.title + '</a>';
		}

		return [
			'<h3>', title, '</h3>',
			'<span class="coordinates">',
				props.title,
				' (',
				this._formatLatitude(coords[1]),
				', ',
				this._formatLongitude(coords[0]),
				')',
			'</span>',
			'<dl class="ground_motion">',
				'<dt class="ss">Ss</dt>',
				'<dd class="ss">', props.ss.toFixed(3), '</dd>',

				'<dt class="s1">S1</dt>',
				'<dd class="s1">', props.s1.toFixed(3), '</dd>',
			'</dl>',
			'<p class="description">',
				meta.description,
			'</p>'
		].join('');
	};

	UfcLayer.prototype._formatLatitude = function (lat) {
		var label = '&deg;N';

		if (lat < 0.0) {
			label = '&deg;S';
			lat *= -1.0;
		}

		return '' + lat.toFixed(4) + label;
	};

	UfcLayer.prototype._formatLongitude = function (lng) {
		var label = '&deg;E';

		if (lng < 0.0) {
			label = '&deg;W';
			lng *= -1.0;
		}

		return '' + lng.toFixed(4) + label;
	};

	return UfcLayer;
});
