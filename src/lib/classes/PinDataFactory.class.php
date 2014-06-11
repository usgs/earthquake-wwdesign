<?php

class PinDataFactory {

	private $metatable = 'UFC_METADATA';
	private $datatable = 'UFC_DESIGN_DATA';

	public function __construct ($db) {
		$this->db = $db;
	}

	/**
	 * @return An array of available datasets with corresponding meta information.
	 */
	public function getPinDatasets () {
		$query = 'SELECT * FROM ' . $this->metatable . ' ORDER BY ID';
		$datasets = array();
		$results = $this->db->query($query);
		$rows = $results->fetchAll(PDO::FETCH_ASSOC);

		foreach ($rows as $id => $row) {
			$datasets['dataset_' . $row['id']] = array(
				'description' => $row['description'],
				'shorttitle' => $row['short_title'],
				'title' => $row['title'],
				'link' => $row['url'],
				'code' => $row['code']
			);
		}

		$results->closeCursor();

		return $datasets;
	}

	/**
	 * @return An array of available data. Data is structured grouped by site.
	 */
	public function getPinData () {
		$query = 'SELECT * FROM ' . $this->datatable .
				' ORDER BY name, metadata_id';
		$pin = null;
		$data = array();
		$results = $this->db->query($query);
		$rows = $results->fetchAll(PDO::FETCH_ASSOC);

		foreach ($rows as $id => $row) {

			if ($pin === null ||
					$pin['properties']['datasets'][0]['title'] !== $row['name']) {

				if ($pin !== null) {
					$data[] = $pin;
				}

				$pin = array(
					'type' => 'Feature',
					'geometry' => array(
						'type' => 'Point',
						'coordinates' => array(
							floatval($row['lon']),
							floatval($row['lat']),
							0.0
						)
					),
					'properties' => array(
						'datasets' => array()
					)
				);
			}

			$pin['properties']['datasets'][] = array(
				'dataset' => 'dataset_' . $row['metadata_id'],
				'title' => $row['name'],
				'ss' => floatval($row['ss']),
				's1' => floatval($row['s1']),
				'quality' => $row['quality'] !== null ? intval($row['quality']) : null
			);
		}

		$data[] = $pin;

		$results->closeCursor();

		return $data;
	}
}
