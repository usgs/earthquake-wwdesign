/* global define */
define([
	'util/Util',
	'GlobalMapView',
	'GlobalCoordinateView',
	'GlobalCalculator',
], function (
	Util,
	GlobalMapView,
	GlobalCoordinateView,
	GlobalCalculator
) {
	'use strict';

	var DEFAULTS = {
		mapView: {

		},
		coordinateView: {

		},
		calculator: {

		}
	};

	var GlobalDesignApplication = function (options) {
		var _this = this;

		options = Util.extend({}, DEFAULTS, options || {});

		this._el = options.el || document.createElement('div');

		options.coordinateView.el = this._el.appendChild(
				document.createElement('div'));
		options.mapView.el = this._el.appendChild(document.createElement('div'));


		// Instantiate sub-views that compose this application
		this._mapView = new GlobalMapView(options.mapView);
		this._coordinateView = new GlobalCoordinateView(options.coordinateView);

		// Utility calculator that performs AJAX datamining
		this._calculator = new GlobalCalculator(options.calculator);

		// Bind listeners
		this._mapView.on('location-change', this._coordinateView.render,
				this._coordinateView);
		this._coordinateView.on('location-change', this._mapView.render,
			this._mapView);

		this._mapView.on('location-change', this._calculator.calculate,
				this._calculator);
		this._coordinateView.on('location-change', this._calculator.calculate,
			this._calculator);

		this._calculator.on('results', function (results) {
			// Make sure coordinate view is showing coordinates for these results
			_this._coordinateView.render(results.location);
			// Make sure map view is showing coordinates for these results
			_this._mapView.render(results.location);

			// Show results in map view. TODO :: Should results be a first-class view?
			_this._mapView.showResults(results);
		});
	};


	return GlobalDesignApplication;
});
