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

		this._layerGroup = [];
		this._serviceUrl = options.serviceUrl;
		this._icon = options.icon;
		this._map = options.map;
		this._layerControl = options.layerControl;

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
		var datasetKey, dataset, layer, feature, datasetsCopy,
				numResults = response.features.length,
				datasetIndexMap = [],
				firstLayer = true;

		this._datasets = response.datasets;

		// Set up one layer per dataset.
		for (datasetKey in this._datasets) {
			// Add layer.
			layer = this._layerGroup.push(new L.LayerGroup()) - 1;

			if (firstLayer)
			{
				this._layerGroup[layer].addTo(this._map);
				firstLayer = false;
			}

			this._layerControl.addOverlayRadio(this._layerGroup[layer],
				this._datasets[datasetKey].shorttitle, 'Pins');

			// Map dataset key names to a layer index.
			datasetIndexMap[datasetKey] = layer;
		}

		// Add all of the points to one of the layers.
		for (feature = 0; feature < numResults; feature++) {
			// Make a copy of this feature's data, because the next section will destroy it.
			datasetsCopy = response.features[feature].properties.datasets.slice(0);

			// Iterate through datasets, and make one marker per feature-dataset combination.
			for (dataset in datasetsCopy) {
				// Get the layer number mapped to the dataset ID string.
				layer = datasetIndexMap[datasetsCopy[dataset].dataset];

				// Make sure only this dataset appears in the marker.
				response.features[feature].properties.datasets = [datasetsCopy[dataset]];

				// Add marker to map layer.
				this._layerGroup[layer].addLayer(this._createMarker(response.features[feature]));
			}
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
