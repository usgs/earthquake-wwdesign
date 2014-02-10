<?php
	$expires = 60 * 60 * 24 * 7;
	include_once 'ufc2json.inc.php';

	$ufc_fp = fopen('http://geohazards.usgs.gov/cfusion/ufc0111-cutdown.cfc?' .
			'method=GetUFCData', 'r');

	$ufcraw = '';
	while ($str = fread($ufc_fp, 1024)) {
		$ufcraw .= $str;
	}
	fclose($ufc_fp);

	header("Content-Type: application/json");
	//header('Expires: ' + gmdate('D, d M Y H:i:s', time() + $expires) . ' GMT');
	print ufc2json($ufcraw);
?>
