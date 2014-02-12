/* global define */
define([
	'util/Util',
	'util/Events',
	'leaflet',
	'tablist',
	'UfcLayer'
], function (
	Util,
	Events,
	L,
	TabList,
	UfcLayer
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
		    layerControl = new L.Control.Layers(),
		    satellite = null,
		    street = null,
		    greyscale = null,
		    ufcController = null;

		// Create the map
		this._map = new L.Map(this._el, {
			center: [0.0, 0.0],
			zoom: 0
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
		ufcController = new UfcLayer();
		ufcController._layerGroup.addTo(this._map);
		layerControl.addOverlay(ufcController._layerGroup, 'UFC Pins');

		// Add the location maker
		this._marker = new L.Marker([0.0, 0.0], {draggable: true});
		this._marker.addTo(this._map);
		this._marker.on('dragend', function () {
			var latlng = _this._marker.getLatLng();
			_this.trigger('location-change', {latitude: latlng.lat,
					longitude: latlng.lng});
		});

		this._popup = new L.Popup({maxWidth:255,maxHeight:250});
		this._popup.setContent(this._options.noLocationText);
		this._marker.bindPopup(this._popup);

		// Add some additional controls
		this._map.addControl(layerControl);
	};

	GlobalMapView.prototype.getMap = function () {
		return this._map;
	};

	GlobalMapView.prototype.render = function (locationEvent) {
		var latitude = locationEvent.latitude,
		    longitude = locationEvent.longitude;

		// Update marker position
		this._marker.setLatLng([latitude, longitude]);
		this._marker.update();

		// Zoom to a 10-degree map extent
		this._map.fitBounds([
			[latitude + 5.0, longitude - 5.0],
			[latitude - 5.0, longitude + 5.0]
		]);
	};

	GlobalMapView.prototype.showResults = function (results) {
		this._popup.setContent(this._parseResultContent(results))
		    .openOn(this._map);
	};


	GlobalMapView.prototype._parseResultContent = function (results) {
		var tabList = new TabList({tabPosition: 'top'}),
		    i = 0, numResults = results.results.length;

		for (i = 0; i < numResults; i++) {
			tabList.addTab(this._createTab(results.results[i], results.location));
		}

		tabList.el.classList.add('global-results');
		return tabList.el;
	};

	GlobalMapView.prototype._createTab = function (result, reqLoc) {
		var tab = {title: result.display_text},
		    title = result.description,
		    interpResult = this._interpolateResult(result.points, reqLoc);

		if (result.link !== '') {
			title = '<a href="' + result.link + '" target="_blank">' + result.description + '</a>';
		}
		tab.content = [
			'<h3>', title, '</h3>',
			'<span class="coordinates">',
				this._formatLatitude(reqLoc.latitude),
				', ',
				this._formatLongitude(reqLoc.longitude),
			'</span>',
			'<dl class="ground_motion">',
				'<dt class="ss">Ss</dt>',
				'<dd class="ss">', interpResult.ss.toFixed(3), 'g</dd>',

				'<dt class="s1">S1</dt>',
				'<dd class="s1">', interpResult.s1.toFixed(3), 'g</dd>',
			'</dl>',
			'<p class="description">',
				result.info_text,
			'</p>'
		].join('');

		return tab;
	};

	GlobalMapView.prototype._formatLatitude = function (lat) {
		var label = '&deg;N';

		if (lat < 0.0) {
			label = '&deg;S';
			lat *= -1.0;
		}

		return '' + lat.toFixed(4) + label;
	};

	GlobalMapView.prototype._formatLongitude = function (lng) {
		var label = '&deg;E';

		if (lng < 0.0) {
			label = '&deg;W';
			lng *= -1.0;
		}

		return '' + lng.toFixed(4) + label;
	};

	GlobalMapView.prototype._interpolateResult = function (points, reqLoc) {
		var interp1 = {}, interp2 = {}, interpolatedResult = {};

		if (points.length === 4) {
			// Interpolated first two points with respect to longitude
			interp1 = this._interpolate(points[0], points[1],
					points[0].longitude, points[1].longitude, reqLoc.longitude);

			// Interpolated second two points with respect to longitude
			interp2 = this._interpolate(points[2], points[3],
					points[2].longitude, points[3].longitude, reqLoc.longitude);

			// Interpolated previous two results with respect to latitude
			interpolatedResult = this._interpolate(interp1, interp2,
					points[0].latitude, points[2].latitude, reqLoc.latitude);

		} else if (points.length === 2) {
			if (points[0].latitude === points[1].latitude) {
				// Same latitudes, interpolate with respect to longitude
				interpolatedResult = this._interpolate(points[0], points[1],
						points[0].longitude, points[1].longitude, reqLoc.longitude);
			} else if (points[0].longitude === points[0].longitude) {
				// Same longitudes, interpolate with respect to latitude
				interpolatedResult = this._interpolate(points[0], points[1],
						points[0].latitude, points[1].latitude, reqLoc.latitude);
			} else {
				// Unexpected result count. Error.
				// TODO
			}
		} else if (points.length === 1) {
			interpolatedResult.ss = points[0].ss;
			interpolatedResult.s1 = points[0].s1;
		} else {
			// TODO :: Error
		}

		return interpolatedResult;
	};

	GlobalMapView.prototype._interpolate = function (y0, y1, x0, x1, x) {
		var interpolatedResult = {},
		    weight = (x - x0) / (x1 - x0);

		interpolatedResult.ss = y0.ss + ((y1.ss - y0.ss) * weight);
		interpolatedResult.s1 = y0.s1 + ((y1.s1 - y0.s1) * weight);

		return interpolatedResult;
	};

	return GlobalMapView;
});
