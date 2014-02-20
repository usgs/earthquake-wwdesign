<?php
	include_once 'functions.inc.php';
	// include_once '../conf/config.inc.php';
	// include_once '../lib/classes/GriddedDataFactory.class.php';

	$latitude  = param('latitude', '10');
	$longitude = param('longitude', '10');

	header("Content-Type: application/json");

	// $factory = new GriddedDataFactory($DB);
	// print json_encode($factory->compute($latitude, $longitude));
	print file_get_contents('http://geohazards.usgs.gov/designmaps/ww/dataminer.php?latitude='.$latitude.'&longitude='.$longitude);
?>
