/* global define */
define([
	'util/Util',
	'mvc/ModalView',
	'GlobalMapView',
	'GlobalCoordinateView',
	'GlobalCalculator',
	'RegionController'
], function (
	Util,
	ModalView,
	GlobalMapView,
	GlobalCoordinateView,
	GlobalCalculator,
	RegionController
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
		this._currentLocation = {latitude: 0.0, longitude: 0.0};

		options.coordinateView.el = this._el.appendChild(
				document.createElement('div'));
		options.mapView.el = this._el.appendChild(document.createElement('div'));


		// Instantiate sub-views that compose this application
		this._mapView = new GlobalMapView(options.mapView);
		this._coordinateView = new GlobalCoordinateView(options.coordinateView);

		// Utility calculator that performs AJAX datamining
		this._calculator = new GlobalCalculator(options.calculator);

		// Region controller. Provides overlays and bounds checking
		this._regionController = new RegionController({map: this._mapView._map});

		// Bind listeners
		this._mapView.on('location-change', this.onLocationChange, this);
		this._coordinateView.on('location-change', this.onLocationChange, this);

		this._calculator.on('results', function (results) {
			// Make sure coordinate view is showing coordinates for these results
			_this._coordinateView.render(results.location);
			// Make sure map view is showing coordinates for these results
			_this._mapView.render(results.location);

			// Show results in map view. TODO :: Should results be a first-class view?
			_this._mapView.showResults(results);
		});

	};

	GlobalDesignApplication.prototype.onLocationChange = function (point) {
		var errorMessage = this._regionController.checkRegionPoint(point),
		    modalWindow = null;

		if (errorMessage) {
			modalWindow = new ModalView(errorMessage, {
				title: 'Better Results Available',
				classes: ['modal-warning']
			});
			modalWindow.show();
			
			// Ensure all views still reflect old location
			this._coordinateView.reset();
			this._mapView.reset();
		} else {
			// Update the views
			this._mapView.render(point);
			this._coordinateView.render(point);

			// Start the calculation
			this._calculator.calculate(point);

			// Update current location
			this._currentLocation = point;
		}
	};

	return GlobalDesignApplication;
});