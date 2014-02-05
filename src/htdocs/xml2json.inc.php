<?php

function xml2json ($xml) {
	$xmlobj = simplexml_load_string($xml);
	$json = array();

	$status = $xmlobj->status;
	$location = $xmlobj->location;
	$results = $xmlobj->result;

	$json['status'] = intval($status['value']);

	$json['location'] = array(
		'latitude' => floatval($location['latitude']),
		'longitude' => floatval($location['longitude'])
	);

	$json['results'] = array();
	foreach ($results as $result) {
		$json['results'][] = _parseResult($result);
	}

	return json_encode($json);
}

function _parseResult ($result) {
	$jsonResult = array(
		'description' => (string) $result['description'],
		'display_text' => (string) $result['display_tx'],
		'grid_spacing' => floatval($result['grid_spacing']),
		'info_text' => (string) $result['info_tx'],
		'link' => (string) $result['link'],
		'source' => (string) $result['source'],
		'points' => array()
	);

	$points = $result->point;
	foreach ($points as $point) {
		$jsonResult['points'][] = _parsePoint($point);
	}

	return $jsonResult;
}

function _parsePoint ($point) {
	$ground_motion = $point->ground_motion;
	$jsonPoint = array(
		'latitude' => floatval($point['latitude']),
		'longitude' => floatval($point['longitude']),
		'ss' => floatval($ground_motion['ss']),
		's1' => floatval($ground_motion['s1'])
	);

	return $jsonPoint;
}
?>
