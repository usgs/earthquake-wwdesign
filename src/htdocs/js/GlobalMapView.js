/* global define */
define([
	'util/Util',
	'util/Events',
	'leaflet',
	'leaflet.groupedlayercontrol',
	'UfcLayer',
	'ResultFormatter'
], function (
	Util,
	Events,
	L,
	groupedlayercontrol,
	UfcLayer,
	ResultFormatter
) {
	'use strict';

	var ESRI_PREFIX = 'https://services.arcgisonline.com/ArcGIS/rest/services/';
	var ESRI_SUFFIX = '/MapServer/tile/{z}/{y}/{x}';
	var DEFAULTS = {
		defaultExtent: [[60.0, -175.0], [-60.0, 175.0]],
		noLocationText: 'Choose a location to see results.'
	};

	var GlobalMapView = function (options) {
		Events.call(this);

		this._options = Util.extend({}, DEFAULTS, options || {});

		this._el = options.el || document.createElement('div');
		this._el.classList.add('global-map-view');

		this._initialize();
	};
	GlobalMapView.prototype = Object.create(Events.prototype);

	GlobalMapView.prototype.reset = function () {
		this._marker.closePopup().setLatLng([0.0, 0.0]);
		this._popup.setContent(this._options.noLocationText);
		this._map.fitBounds(this._options.defaultExtent);
	};

	GlobalMapView.prototype._initialize = function () {

		var _this = this,
		    layerControl = new L.Control.GroupedLayers(),
		    satellite = null,
		    street = null,
		    greyscale = null,
		    ufcController = null;

		// Create the map
		this._map = new L.Map(this._el, {
			center: [0.0, 0.0],
			zoom: 0,
			worldCopyJump: true,
			zoomAnimation:false
		});

		// Add map layers
		satellite = new L.TileLayer(ESRI_PREFIX + 'World_Imagery' + ESRI_SUFFIX);
		satellite.addTo(this._map);
		layerControl.addBaseLayer(satellite, 'Satellite');

		street = new L.TileLayer(ESRI_PREFIX + 'World_Street_Map' + ESRI_SUFFIX);
		layerControl.addBaseLayer(street, 'Street');

		greyscale = new L.TileLayer(ESRI_PREFIX + 'Canvas/World_Light_Gray_Base' +
				ESRI_SUFFIX);
		layerControl.addBaseLayer(greyscale, 'Greyscale');

		// Set viewport to one instance of world
		this._map.fitBounds(this._options.defaultExtent);

		// UFC Layer (TODO :: Split these?)
		ufcController = new UfcLayer({
			'map': this._map,
			'layerControl': layerControl
		});

		// Add the location marker
		this._marker = new L.Marker([0.0, 0.0], {draggable: true});
		this._marker.addTo(this._map);
		this._marker.on('dragend', function () {
			var latlng = _this._marker.getLatLng();
			_this.trigger('location-change', {latitude: latlng.lat,
					longitude: latlng.lng});
		});

		this._popup = new L.Popup({autoPan:false, minWidth:350,
				maxWidth:1000, maxHeight:250});
		this._popup.setContent(this._options.noLocationText);
		this._marker.bindPopup(this._popup);

		// Add some additional controls
		this._layerControl = layerControl;
		this._map.addControl(layerControl);
	};

	GlobalMapView.prototype.getMap = function () {
		return this._map;
	};

	GlobalMapView.prototype.getLayerControl = function () {
		return this._layerControl;
	};

	GlobalMapView.prototype.render = function (locationEvent) {
		var latitude = locationEvent.latitude,
		    longitude = locationEvent.longitude;

		// Update marker position
		this._marker.setLatLng([latitude, longitude]);
		this._marker.update();

		// Zoom to a 10-degree map extent
		this._map.fitBounds([
			[latitude + 7.5, longitude - 5.0],
			[latitude - 2.5, longitude + 5.0]
		]);
	};

	GlobalMapView.prototype.showResults = function (results) {
		this._popup.setContent(ResultFormatter.getMarkup(results)).openOn(
				this._map);
	};

	return GlobalMapView;
});
