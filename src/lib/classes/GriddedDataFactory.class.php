<?php

class GriddedDataFactory {

	private $metatable = 'metadata';
	private $regiontable = 'region';
	private $datatable = 'design_data';

	public function __construct ($db) {
		$this->db = $db;

		$this->statement = $this->db->prepare('
			SELECT
				m.id,
				m.description,
				m.display_name,
				m.grid_spacing,
				m.other_info,
				m.links,
				m.quality,
				d.lat,
				d.lon,
				d.ss,
				d.s1
			FROM
				metadata AS m
			JOIN
				design_data AS d ON (
					m.id = d.metadata_id AND
					d.lat > :latitude - 1.0 AND d.lat < :latitude + 1.0 AND
					d.lon > :longitude - 1.0 AND d.lon < :longitude + 1.0
				)
			WHERE
				d.lat > :latitude - m.grid_spacing AND
				d.lat < :latitude + m.grid_spacing AND
				d.lon > :longitude - m.grid_spacing AND
				d.lon < :longitude + m.grid_spacing
			ORDER BY
				m.id,
				d.lat DESC,
				d.lon ASC
		');
	}

	public function compute ($latitude, $longitude) {
		$latitude = floatval($latitude);
		$longitude = floatval($longitude);

		$this->statement->bindParam(':latitude', $latitude);
		$this->statement->bindParam(':longitude', $longitude);
		$this->statement->execute();

		$rows = $this->statement->fetchAll(PDO::FETCH_ASSOC);
		$results = array();
		$numResults = 0;
		$data = null;

		foreach ($rows as $row) {
			// If one of the Ss/S1 values is null, return no results.
			if ($row['ss'] === null || $row['s1'] === null) {
				// Reset results and deallocate arrays.
				$results = array();
				$data = null;
				$numResults = 0;
				break;
			}

			if ($data === null || $data['datasetid'] !== $row['id']) {

				if ($data !== null) {
					$results[] = $data;
				}

				$data = array(
					'datasetid' => $row['id'],
					'description' => $row['description'],
					'display_text' => $row['display_name'],
					'grid_spacing' => floatval($row['grid_spacing']),
					'info_text' => $row['other_info'],
					'link' => $row['links'],
					'quality' => $row['quality'],
					'points' => array()
				);
			}

			$data['points'][] = array(
				'latitude' => floatval($row['lat']),
				'longitude' => floatval($row['lon']),
				'ss' => floatval($row['ss']),
				's1' => floatval($row['s1'])
			);

			$numResults += 1;
		}

		if ($data !== null) {
			$results[] = $data;
		}

		$this->statement->closeCursor();

		return array(
			'status' => $numResults,
			'location' => array(
				'latitude' => floatval($latitude),
				'longitude' => floatval($longitude)
			),
			'results' => $results
		);
	}
}
