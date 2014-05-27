/* global define */
define([
	'tablist'
], function (
	TabList
) {
	'use strict';

	var getMarkup = function (data) {
		var results = data.results,
		    i = 0, numResults = results.length,
		    el = document.createElement('section'),
		    summaryMarkup = null, infoMarkup = null, tabs = [null], tabWidget = null;

		if (numResults === 1) {
			// Only one result. Skip summary tab.
			el.innerHTML = [
				'<section class="tablist-panel selected">',
					_createTabContent(results[0], results[0].points[0], data.location,
							_computeQualityFlag(results[0])),
				'</section>'
			].join('');

			el.classList.add('single-result');
		} else {
			// Multiple results. Create summary tab and loop over each result.
			summaryMarkup = [
				'<h3>Summary</h3>',
				'<span class="coordinates">',
					(results[0].title) ? results[0].title + ' (' : '',
					_formatLatitude(data.location.latitude),
					', ',
					_formatLongitude(data.location.longitude),
					(results[0].title) ? ')' : '',
				'</span>',
				'<table>',
					'<thead>',
						'<tr>',
							'<th scope="col">Source</th>',
							'<th scope="col">S<sub>S</sub></th>',
							'<th scope="col">S<sub>1</sub></th>',
							'<th scope="col">Classification</th>',
						'</tr>',
					'</thead>',
					'<tbody>'
			];

			for (; i < numResults; i++) {
				tabs.push(_createTab(results[i], data.location, summaryMarkup));
			}

			infoMarkup = [
				'<p class="description">',
					'The classification is based on the ',
					'<a href="https://github.com/usgs/earthquake-wwdesign/wiki/Worldwide-Seismic-Design-Tool-Documentation">',
					'recency and breadth of the seismic hazard analysis</a> ',
					'from each underlying source.',
				'</p>'
			];

			// Inject summary tab to front of list
			tabs[0] = {
				title: '<span>Summary</span>',
				content: summaryMarkup.join('') + '</tbody></table>' +
						infoMarkup.join('')
			};

			tabWidget = new TabList({el: el, tabs: tabs, tabPosition: 'top'});
		}

		el.classList.add('global-results');
		return el;
	};

	var _createTab = function (result, coords, summaryMarkup) {
		var qualityFlag = _computeQualityFlag(result);
		var interpResult = _interpolateResult(result.points, coords);

		if (summaryMarkup) {
			summaryMarkup.push(_createSummaryRecord(
					result, interpResult, qualityFlag));
		}

		return {
			title: _createTabTitle(result, qualityFlag),
			content: _createTabContent(result, interpResult, coords, qualityFlag)
		};
	};

	var _createSummaryRecord = function (meta, data, quality) {
		return [
			'<tr>',
				'<th scope="row">', meta.display_text, '</th>',
				'<td>', data.ss.toFixed(2), 'g</td>',
				'<td>', data.s1.toFixed(2), 'g</td>',
				'<td class="quality quality-', quality.toLowerCase(), '">',
					quality,
				'</td>',
			'</tr>'
		].join('');
	};

	var _createTabTitle = function (meta, quality) {
		return '<span class="quality-' + quality.toLowerCase() + '">' +
				meta.display_text + '</span>';
	};

	var _createTabContent = function (meta, data, coords, quality) {
		var title = meta.description;

		if (meta.link) {
			title = '<a href="' + meta.link + '" target="_blank">' +
					meta.description + '</a>';
		}

		return [
			'<h3>', title, '</h3>',
			'<span class="coordinates">',
				(meta.title) ? meta.title + ' (' : '',
				_formatLatitude(coords.latitude),
				', ',
				_formatLongitude(coords.longitude),
				(meta.title) ? ')' : '',
			'</span>',
			'<dl class="ground_motion">',
				'<dt class="ss">S<sub>S</sub></dt>',
				'<dd class="ss">', data.ss.toFixed(2), 'g</dd>',

				'<dt class="s1">S<sub>1</sub></dt>',
				'<dd class="s1">', data.s1.toFixed(2), 'g</dd>',

				'<dt class="quality">Classification</dt>',
				'<dd class="quality quality-', quality.toLowerCase(), '">',
					quality,
				'</dt>',
			'</dl>',
			'<p class="description">',
				meta.info_text,
			'</p>'
		].join('');
	};

	var _interpolateResult = function (points, coords) {
		var interp1 = {}, interp2 = {}, interpolatedResult = {};

		if (points.length === 4) {
			// Interpolated first two points with respect to longitude
			interp1 = _interpolate(points[0], points[1],
					points[0].longitude, points[1].longitude, coords.longitude);

			// Interpolated second two points with respect to longitude
			interp2 = _interpolate(points[2], points[3],
					points[2].longitude, points[3].longitude, coords.longitude);

			// Interpolated previous two results with respect to latitude
			interpolatedResult = _interpolate(interp1, interp2,
					points[0].latitude, points[2].latitude, coords.latitude);

		} else if (points.length === 2) {
			if (points[0].latitude === points[1].latitude) {
				// Same latitudes, interpolate with respect to longitude
				interpolatedResult = _interpolate(points[0], points[1],
						points[0].longitude, points[1].longitude, coords.longitude);
			} else if (points[0].longitude === points[0].longitude) {
				// Same longitudes, interpolate with respect to latitude
				interpolatedResult = _interpolate(points[0], points[1],
						points[0].latitude, points[1].latitude, coords.latitude);
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

	var _formatLatitude = function (lat) {
		var label = '&deg;N';

		if (lat < 0.0) {
			label = '&deg;S';
			lat *= -1.0;
		}

		return '' + lat.toFixed(4) + label;
	};

	var _formatLongitude = function (lng) {
		var label = '&deg;E';

		if (lng < 0.0) {
			label = '&deg;W';
			lng *= -1.0;
		}

		return '' + lng.toFixed(4) + label;
	};

	var _computeQualityFlag = function (dataset) {
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

	var _interpolate = function (y0, y1, x0, x1, x) {
		var interpolatedResult = {},
		    weight = (x - x0) / (x1 - x0);

		interpolatedResult.ss = y0.ss + ((y1.ss - y0.ss) * weight);
		interpolatedResult.s1 = y0.s1 + ((y1.s1 - y0.s1) * weight);

		return interpolatedResult;
	};

	return {
		getMarkup: getMarkup
	};
});
