/* global define */
define([
	'util/Util',
	'util/Xhr',
	'leaflet',

	'ResultFormatter'
], function (
	Util,
	Xhr,
	L,

	ResultFormatter
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
		var results = this._featureToResult(feature);

		var marker = new L.Marker(
			[results.location.latitude, results.location.longitude],
			{
				icon: this._icon,
				title: results.results[0].title
			}
		);

		marker.bindPopup(ResultFormatter.getMarkup(results), {'minWidth': '350'});

		return marker;
	};

	/**
	 * Reformats in input UFC feature to make it look like a gridded result.
	 *
	 * @param feature {Feature}
	 *        The GeoJSON feature returned by the web service.
	 * @return {Object}
	 *         An object that looks and feels like a gridded data request.
	 */
	UfcLayer.prototype._featureToResult = function (feature) {
		var featureData = feature.properties.datasets,
		    datasets = this._datasets, data = null, metadata = null,
		    i = 0, numFeatureData = featureData.length;

		var result = {
			status: numFeatureData,
			location: {
				latitude: feature.geometry.coordinates[1],
				longitude: feature.geometry.coordinates[0]
			},
			results: []
		};

		for (; i < numFeatureData; i++) {
			data = featureData[i];
			metadata = datasets[data.dataset];

			result.results.push({
				description: metadata.title,
				display_text: metadata.shorttitle,
				grid_spacing: null,
				info_text: metadata.description,
				link: metadata.link,
				title: data.title,
				quality: data.quality,
				points: [
					{
						latitude: result.location.latitude,
						longitude: result.location.longitude,
						ss: data.ss,
						s1: data.s1
					}
				]
			});
		}

		return result;
	};

	return UfcLayer;
});
