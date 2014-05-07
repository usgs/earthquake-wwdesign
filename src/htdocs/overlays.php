<?php
	header("Content-Type: application/json");

 	/*
		Data is the form of an array of OVERLAYS which is made up of regions.
		Each region is an array of points defining the polygon for the region
		(note that the closing point for the polygon is not repeated).

		region AS r,
		points AS p,
		latitude AS a,
		longitude AS o
	*/

?> 

[
	{
		"r": "CAN",
		"s": "Seismic design parameter values for Canadian sites can be accessed through the <a href=\"http://www.earthquakescanada.nrcan.gc.ca/hazard-alea/interpolat/index_2010-eng.php\" target=\"_blank\">Natural Resources Canada 2010 National Building Code of Canada seismic hazard calculator</a>. To convert the output values to SS and S1, use the Site Class B row of Table 5 in <a href=\"http://ottawa.seismo.ca/hazard/2010CJCE/2010CJCE_Mitchelletal.pdf\" target=\"_blank\">this document</a>.",
		"p": [[47.002313,-93.145452],[47.002313,-93.814199],[47.002313,-95.551364],[47.002313,-99.301355],[47.002313,-103.63315],[47.002313,-107.610574],[47.002313,-111.921212],[47.002313,-115.962105],[47.002313,-120.346791],[47.002313,-124.562225],[47.002313,-128.793527],[46.990033,-131.881549],[48.05909,-131.881549],[48.05909,-132.950606],[49.448864,-132.950606],[49.448864,-134.304745],[50.37538,-134.304745],[50.37538,-135.195626],[51.408801,-135.195626],[51.408801,-136.193412],[52.477858,-136.193412],[52.477858,-137.226834],[53.368739,-137.226834],[53.368739,-138.082079],[54.437796,-138.082079],[54.437796,-139.151136],[55.542488,-139.151136],[55.542488,-140.327098],[56.469004,-140.327098],[56.469004,-141.075438],[57.324249,-141.075438],[57.324249,-141.859413],[58.036954,-141.859413],[58.036954,-142.643388],[58.820929,-142.643388],[58.820929,-143.641175],[59.391092,-143.641175],[59.426728,-144.282609],[59.818715,-144.282609],[59.818715,-144.995313],[64.48693,-144.995313],[74.999322,-144.995313],[74.999322,-127.961674],[74.999322,-127.337153],[80.021891,-127.337153],[80.021891,-122.117497],[80.021891,-119.123311],[80.021891,-100.853589],[83.17716,-100.853589],[83.953045,-100.853589],[83.953045,-60.662711],[80.6426,-60.662711],[80.6426,-68.111214],[79.297731,-68.111214],[79.297731,-73.33551],[77.590783,-73.33551],[77.590783,-77.370116],[74.12516,-77.370116],[74.12516,-74.939008],[72.780292,-74.939008],[72.780292,-73.542413],[72.780292,-66.352539],[68.849138,-66.352539],[68.849138,-60.973066],[68.84719,-57.035806],[66.939102,-57.035806],[66.939102,-55.509335],[64.649396,-55.509335],[64.649396,-53.792056],[63.313735,-53.792056],[63.313735,-52.217884],[61.930371,-52.217884],[61.930371,-50.786818],[60.690114,-50.786818],[60.690114,-49.689668],[59.259048,-49.689668],[59.259048,-48.974135],[57.541769,-48.974135],[57.541769,-48.306304],[55.967597,-48.306304],[55.967597,-47.590771],[54.107211,-47.590771],[54.107211,-46.875238],[51.340484,-46.875238],[51.340484,-45.82579],[44.662176,-45.82579],[44.662176,-47.495367],[42.897195,-47.495367],[42.897195,-50.118987],[39.987361,-50.118987],[39.987361,-67.434884],[42.038556,-67.434884],[42.628578,-67.387173],[42.628739,-67.697408],[42.990819,-67.749134],[42.990819,-70.344718],[42.990819,-71.441869],[42.990819,-72.507899],[43.002877,-74.192363],[42.783858,-74.192363],[42.783858,-75.041061],[42.45533,-75.041061],[42.45533,-75.725495],[42.154179,-75.725495],[42.154179,-76.519438],[41.880405,-76.519438],[41.880405,-77.286003],[41.579255,-77.286003],[41.579255,-77.778796],[41.332859,-77.778796],[41.332859,-78.435852],[41.086462,-78.435852],[41.086462,-79.147663],[40.812689,-79.147663],[40.812689,-79.667833],[40.59367,-79.667833],[40.59367,-80.297512],[40.319897,-80.297512],[40.319897,-81.064077],[39.991369,-81.06407],[39.991369,-84.979038],[44.919291,-84.979038],[44.919291,-85.362321],[45.329951,-85.362321],[45.329951,-85.800358],[45.740611,-85.800358],[45.740611,-86.320528],[46.178649,-86.320528],[46.178649,-86.840698],[46.616687,-86.840698],[46.616687,-87.388245],[46.999969,-87.388245],[47.002313,-92.314419]]
	},
	{
		"r": "US",
		"s": "Seismic design parameter values for sites within the U.S.A. and its territories can be accessed through the <a href=\"http://earthquake.usgs.gov/hazards/designmaps/usdesign.php\">U.S. Seismic Design Maps web application</a>.",
		"p": [[50,-125],[24.6,-125],[24.6,-65],[50,-65]]
	},
	{
		"r": "AK",
		"s": "Seismic design parameter values for sites within the U.S.A. and its territories can be accessed through the <a href=\"http://earthquake.usgs.gov/hazards/designmaps/usdesign.php\">U.S. Seismic Design Maps web application</a>.",
		"p": [[72,-130],[50,-130],[50,-180],[72,-180]]
	},
	{
		"r": "HI",
		"s": "Seismic design parameter values for sites within the U.S.A. and its territories can be accessed through the <a href=\"http://earthquake.usgs.gov/hazards/designmaps/usdesign.php\">U.S. Seismic Design Maps web application</a>.",
		"p": [[23,-154],[18,-154],[18,-161],[23,-161]]
	},
	{
		"r": "PR",
		"s": "Seismic design parameter values for sites within the U.S.A. and its territories can be accessed through the <a href=\"http://earthquake.usgs.gov/hazards/designmaps/usdesign.php\">U.S. Seismic Design Maps web application</a>.",
		"p": [[19,-64.5],[17.5,-64.5],[17.5,-67.5],[19,-67.5]]
	},

	{
		"r": "SEAsia",
		"p": [[22,94],[6,94],[6,92],[-10,92],[-10,118],[8,118],[8,108],[22,108]]
	},
	{
		"r": "Afghanistan",
		"p": [[41,56],[26,56],[26,79],[41,79]]
	},
	{
		"r": "HA",
		"p": [[20.15,-71.5],[20.15,-74.5],[18,-74.5],[18,-71.5]]
	},
	{
		"r": "Guam",
		"s": "Seismic design parameter values for sites within the U.S.A. and its territories can be accessed through the <a href=\"http://earthquake.usgs.gov/hazards/designmaps/usdesign.php\">U.S. Seismic Design Maps web application</a>.",
		"p": [[23, 139],[23,151],[9,151],[9,139]]
	},
	{
		"r": "AMSAM",
		"s": "Seismic design parameter values for sites within the U.S.A. and its territories can be accessed through the <a href=\"http://earthquake.usgs.gov/hazards/designmaps/usdesign.php\">U.S. Seismic Design Maps web application</a>.",
		"p": [[-11,-195],[-11,-165],[-33,-165],[-33,-195]]
	}
]
