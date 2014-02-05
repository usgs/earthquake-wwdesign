<?php
	$expires = 60 * 60 * 24 * 7;
	include_once 'functions.inc.php';
	include_once 'xml2json.inc.php';

	$latitude  = param('latitude', '10');
	$longitude = param('longitude', '10');

	$URL = 'http://geohazards.usgs.gov/cfusion/gsd_arup_all.cfc';

	//returns values from Richard's XML output from database
	$fp=fopen(
		sprintf(
			"${URL}?method=GetGSDLatLon&latitude=%s&longitude=%s",
			$latitude,$longitude),
		'r'
	);

	header("Content-Type: application/json");
	header('Expires: ' + gmdate('D, d M Y H:i:s', time() + $expires) . ' GMT');

	$xml = '';
	while(($str=fread($fp, 1024))) {
		$xml .= $str;
	}

	print xml2json($xml);

	fclose($fp);
?>
