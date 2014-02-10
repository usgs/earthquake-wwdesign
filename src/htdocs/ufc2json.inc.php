<?php

function ufc2json ($ufc) {
	$ufcobj = simplexml_load_string($ufc);
	$ufcjson = array(
		'type' => 'FeatureCollection',
		'datasets' => array(),
		'features' => array()
	);
	$results_index = array();

	$datasets = $ufcobj->metainfo->dataset;
	foreach ($datasets as $dataset) {
		$id = (string) $dataset['id'];
		$ufcjson['datasets'][$id] = array(
			'description' => (string) $dataset['desc'],
			'shorttitle' => (string) $dataset['shorttitle'],
			'title' => (string) $dataset['title'],
			'link' => (string) $dataset['url']
		);
	}

	$results = $ufcobj->results->result;
	foreach ($results as $result) {
		$latitude = floatval($result['lat']);
		$longitude = floatval($result['lon']);
		$loc = $latitude . '_' . $longitude;

		if (isset($results_index[$loc])) {
			$pin = $results_index[$loc];
		} else {
			$pin = array(
				'type' => 'Feature',
				'geometry' => array(
					'type' => 'Point',
					'coordinates' => array($longitude, $latitude, 0.0)
				),
				'properties' => array(
					'datasets' => array()
				)
			);
		}
		
		$pin['properties']['datasets'][] = array(
			'dataset' => (string) $result['datasetid'],
			'title' => (string) $result['name'],
			'ss' => floatval($result['ss']),
			's1' => floatval($result['s1'])
		);

		$results_index[$loc] = $pin;
	}

	// Now flatten it back out to an array
	foreach ($results_index as $result) {
		$ufcjson['features'][] = $result;
	}

	return json_encode($ufcjson);
}

?>
