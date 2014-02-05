/* global define */
define([
	'util/Util',
	'mvc/View'
], function (
	Util,
	View
) {
	'use strict';

	var DEFAULTS = {

	};

	var GlobalCoordinateView = function (options) {
		View.call(this);

		options = Util.extend({}, DEFAULTS, options || {});
		this._el = options.el || document.createElement('div');

		this._el.classList.add('global-coordinate-view');
		this._initialize();
	};
	GlobalCoordinateView.prototype = Object.create(View.prototype);

	GlobalCoordinateView.prototype.render = function (locationEvent) {
		if (this._latitude && this._longitude) {
			this._latitude.value = locationEvent.latitude.toFixed(4);
			this._longitude.value = locationEvent.longitude.toFixed(4);
		}
	};



	GlobalCoordinateView.prototype._initialize = function () {
		var _this = this;

		this._el.innerHTML = [
			'<label for="gcv-latitude">Lat</label>',
			'<input type="text" id="gcv-latitude"/>',

			'<label for="gcv-longitude">Lon</label>',
			'<input type="text" id="gcv-longitude"/>',

			'<button id="gcv-submit">Set Location</button>'
		].join('');

		this._latitude = this._el.querySelector('#gcv-latitude');
		this._longitude = this._el.querySelector('#gcv-longitude');
		this._setLocationBtn = this._el.querySelector('#gcv-submit');

		this._setLocationBtn.addEventListener('click', function () {
			var latitude = parseFloat(_this._latitude.value),
			    longitude = parseFloat(_this._longitude.value);

			if (isNaN(latitude) || isNaN(longitude)) {
				// TODO :: Improve this
				try { console.log('Error: Latitude and longitude must be a number!'); }
				catch (e) { /* Ignore */ }
				return;
			}

			_this.trigger('location-change', {latitude: latitude,
					longitude: longitude});
		});
	};

	return GlobalCoordinateView;
});
