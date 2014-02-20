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
		    qualityFlag = null,
		    i = 0, numDatasets = datasets.length, dataset = null, tabList = null,
		    summaryContent = [], summaryEl = document.createElement('div');

		var marker = new L.Marker([coordinates[1], coordinates[0]], {
			icon: this._icon,
			title: datasets[0].title
		});

		summaryContent = [
			'<table>',
				'<thead>',
					'<tr>',
						'<th scope="col">Dataset</th>',
						'<th scope="col">Ss</th>',
						'<th scope="col">S1</th>',
						'<th scope="col">Quality</th>',
					'</tr>',
				'</thead>',
				'<tbody>'
		];

		if (numDatasets === 1) {
			// No need for tabs
			dataset = this._datasets[datasets[i].dataset];
			marker.bindPopup(this._createTabContent(dataset, datasets[0],
					coordinates, this._computeQualityFlag(datasets[0])));
		} else {

			tabList = new TabList({tabPosition: 'top'});
			tabList.addTab({title: '<span>Summary</span>', content: summaryEl});

			for (i = 0; i < numDatasets; i++) {
				dataset = this._datasets[datasets[i].dataset];
				qualityFlag = this._computeQualityFlag(datasets[i]);

				tabList.addTab({
					title: this._createTabTitle(dataset, qualityFlag),
					content: this._createTabContent(dataset, datasets[i],
							coordinates, qualityFlag)
				});

				Array.prototype.push.apply(summaryContent, [
					'<tr class="quality-', qualityFlag.toLowerCase(), '">',
						'<th scope="row">', dataset.shorttitle, '</th>',
						'<td>', datasets[i].ss.toFixed(2), 'g</td>',
						'<td>', datasets[i].s1.toFixed(2), 'g</td>',
						'<td>', qualityFlag, '</td>',
					'</tr>'
				]);
			}

			summaryEl.innerHTML = summaryContent.join('') + '</tbody></table>';

			tabList.el.classList.add('global-results');
			marker.bindPopup(tabList.el);
		}

		return marker;
	};

	UfcLayer.prototype._createTabTitle = function (dataset, q) {
		return '<span class="quality-' + q.toLowerCase() + '">' +
				dataset.shorttitle + '</span>';
	};

	UfcLayer.prototype._createTabContent = function (meta, props, coords, q) {
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
				'<dd class="ss">', props.ss.toFixed(2), 'g</dd>',

				'<dt class="s1">S1</dt>',
				'<dd class="s1">', props.s1.toFixed(2), 'g</dd>',

				'<dt class="quality">Quality</dt>',
				'<dd class="quality quality-', q.toLowerCase(), '">', q, '</dt>',
			'</dl>',
			'<p class="description">',
				meta.description,
			'</p>'
		].join('');
	};

	UfcLayer.prototype._computeQualityFlag = function (dataset) {
		var quality = dataset.quality;

		if (quality === 1) {
			return 'Red';
		} else if (quality === 2) {
			return 'Yellow';
		} else if (quality === 3) {
			return 'Green';
		} else {
			return 'NaN'; // TODO :: Better options? Must be short
		}
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
