<?php

	include_once '../conf/config.inc.php';
	include_once '../lib/classes/PinDataFactory.class.php';

	$factory = new PinDataFactory($DB);

	header("Content-Type: application/json");

	print_r(json_encode(array(
		'type' => 'FeatureCollection',
		'datasets' => $factory->getPinDatasets(),
		'features' => $factory->getPinData()
	)));
?>
