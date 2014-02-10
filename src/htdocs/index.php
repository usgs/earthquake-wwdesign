<?php
if (!isset($TEMPLATE)) {
	$TITLE = 'Worldwide Seismic Design Tool';

	$HEAD = '<link rel="stylesheet" href="css/index.css"/>';

	$FOOT = '
		<script src="js/index.js"></script>
		<script src="http://localhost:35729/livereload.js?snipver=1"></script>
	';

	include_once 'template.inc.php';
}
?>

<div id="application"></div>
<?php /* TEMPLATE_DOWNGRADE_FOOT_HACK */ ?>
