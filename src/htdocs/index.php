<?php
if (!isset($TEMPLATE)) {
	$TITLE = 'Worldwide Seismic Design Tool (Beta)';

	$HEAD = '<link rel="stylesheet" href="css/index.css"/>';
	$NAVIGATION = true;

	$FOOT = '
		<script src="js/index.js"></script>
		<script src="http://localhost:35729/livereload.js?snipver=1"></script>
	';

	include_once 'template.inc.php';
}
?>
<div id="beta-notifier" class="notification">
	This tool is a Beta release. It provides an informal and incomplete
	collection of S<sub>S</sub> and S<sub>1</sub> values
	<a href="https://github.com/usgs/earthquake-wwdesign/wiki/Worldwide-Seismic-Design-Tool-Documentation">derived
	from existing studies</a>. Seismic design parameter values for sites
	within the U.S.A. and its Territories can be accessed through the
	<a href="http://earthquake.usgs.gov/designmaps/us/application.php">U.S.
	Seismic Design Maps web application</a>.
</div>
<div id="application"></div>
<?php /* TEMPLATE_DOWNGRADE_FOOT_HACK */ ?>
