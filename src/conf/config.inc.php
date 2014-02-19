<?php

$CONFIG = parse_ini_file('config.ini');


$DB = new PDO($CONFIG['DB_DSN'], $CONFIG['DB_USERNAME'],
		$CONFIG['DB_PASSWORD']);

$DB->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if (substr($CONFIG['DB_DSN'], 0, 5) === 'pgsql' &&
		$CONFIG['DB_SCHEMA'] !== '') {
	$DB->exec('SET search_path = ' . $CONFIG['DB_SCHEMA']);
}

?>
