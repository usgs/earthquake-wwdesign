/* global define */
define([
	'util/Xhr',
	'util/Events',
	'util/Util'
], function (
	Xhr,
	Events,
	Util
) {
	'use strict';

	var DEFAULTS = {
		serviceUrl: 'dataminer.php'
	};

	var GlobalCalculator = function (options) {
		Events.call(this);

		options = Util.extend({}, DEFAULTS, options || {});
		this._serviceUrl = options.serviceUrl;
	};
	GlobalCalculator.prototype = Object.create(Events.prototype);

	GlobalCalculator.prototype.calculate = function (locationResult) {
		var _this = this;

		Xhr.ajax({
			url: this._serviceUrl,
			data: locationResult,

			// Must handle success and service errors
			success: function (jsonResult) {
				_this._parseResult(jsonResult);
			},

			// Only handles HTTP-type errors
			error: function (jsonError) {
				_this._parseErrorResult(jsonError);
			}
		});
	};

	GlobalCalculator.prototype._parseResult = function (jsonResult) {

		if (jsonResult.status === 0) {
			// Error
			this.trigger('no-data', jsonResult);
			return;
		}
		this.trigger('results', jsonResult);
	};

	GlobalCalculator.prototype._parseErrorResult = function (/* jsonError */) {
		// TODO
	};

	return GlobalCalculator;
});
