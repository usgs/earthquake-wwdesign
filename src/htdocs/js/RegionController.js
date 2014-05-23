/* global define */
define([
	'util/Util',
	'util/Xhr',
	'leaflet'
], function (
	Util,
	Xhr,
	L
) {
	'use strict';

	var DEFAULTS = {
		serviceUrl: 'overlays.php',
		polyOpts: {
			color: '#F33',
			fill: true,
			weight: 2,
			fillColor: '#FCC',
			clickable: false
		}
	};

	/**
	 * Obligatory point-in-polygon routine. Adapted from:
	 * http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
	 *
	 *
	 * @param poly {Array}
	 *      An array of points. Each point itself is an array of the same form
	 *      as the "point" parameter (see below).
	 * @param point {Array}
	 *      An array representing a geographic coordinate with the latitude value
	 *      in the zeroeth index and the longitude value in the first index.
	 *
	 * @return {Boolean}
	 *     True if the given point is in the given poly. False otherwise.
	 */
	var __contains = function (poly, point) {
		var contains = false,
		    numPoints = poly.length,
		    px = point[1], py = point[0],
		    i, j, vix, viy, vjx, vjy;

		for (i = 0, j = numPoints - 1; i < numPoints; j = i++) {
			vix = poly[i][1];
			viy = poly[i][0];
			vjx = poly[j][1];
			vjy = poly[j][0];

			if (((viy > py) !== (vjy > py)) &&
					(px < (vjx - vix) * (py - viy) / (vjy - viy) + vix)) {
				contains = !contains;
			}
		}

		return contains;
	};

	var RegionController = function (layerControl, options) {
		options = Util.extend({}, DEFAULTS, options || {});

		this._serviceUrl = options.serviceUrl;
		this._overlays = [];
		this._map = options.map || null;
		this._overlaysLoaded = false;
		this._polyOpts = options.polyOpts;
		this._skipRegions = [];

		this._initialize(layerControl);
	};

	RegionController.prototype.ready = function () {
		return this._overlaysLoaded;
	};

	/**
	 * @param point {Object}
	 *      A location-type object with "latitude" and "longitude" keys. The
	 *      corresponding values are both decimal degree floats.
	 *
	 * @return {Mixed}
	 *      If the given point falls within a "skip region", an error message
	 *      {text/html} is returned. Otherwise false is returned.
	 */
	RegionController.prototype.checkRegionPoint = function (point) {
		var i = 0, numRegions = this._skipRegions.length, region = null,
		    pointArr = [point.latitude, point.longitude];

		// Normalize longitude
		while (pointArr[1] < -180.0) { pointArr[1] += 360.0; }
		while (pointArr[1] > 180.0) { pointArr[1] -= 360.0; }

		for (; i < numRegions; i++) {
			region = this._skipRegions[i];
			if (__contains(region.p, pointArr)) {
				// Points in this region should be skipped. Send error message back.
				return region.s;
				// [
				// 	'The input location [',
				// 		point.latitude.toFixed(4), ', ',
				// 		point.longitude.toFixed(4),
				// 	'] falls within the boundary for &ldquo;', region.r, '&rdquo;. ',
				// 	'There are <a href="', region.s, '" target="_blank">more accurate ',
				// 	'results for locations within this region</a>. Please use the link ',
				// 	'above to access those results.'
				// ].join('');
			}
		}
	};

	RegionController.prototype._initialize = function (layerControl) {
		var _this = this;

		Xhr.ajax({
			url: this._serviceUrl,
			success: function (response) {
				_this._onSuccess(response, layerControl);
			},
			error: function (response) {
				this._onError(response);
			}
		});
	};

	RegionController.prototype._onSuccess = function (response, layerControl) {
		var i = 0, numRegions = response.length, overlay = null, info;

		for (; i < numRegions; i++) {
			info = response[i];

			if (info.hasOwnProperty('s') && info.s) {
				// Skip this region continue;
				this._skipRegions.push(info);
			} else {

				overlay = new L.Polygon(info.p, this._polyOpts);

				this._overlays.push(overlay);
				layerControl.addOverlay(overlay, info.n);

				// Enable overlay
				if (this._map) {
					overlay.addTo(this._map);
				}
			}
		}

		this._overlaysLoaded = true;
	};

	RegionController.prototype._onError = function (/*error*/) {
		// TODO :: Handle errors
	};

	return RegionController;
});
