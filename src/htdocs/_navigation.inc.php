<?php
	$eq = 'http://earthquake.usgs.gov/hazards/designmaps';

	// NB: Old template-style navigation stuff exists in this file but is
	//     commented out. This is because the dev version runs the new template
	//     and production code runs the old template. Part of the build process
	//     for this tool does template downgrading and these commented sections
	//     are used to that effect. Proceed with caution.

	// print side_nav_header();

	print
		navItem("${eq}/wwdesign.php", 'Introduction') .
		navItem("index.php", 'Use Application') .
		navItem("${eq}/wwdesigndoc.php", "Documentation") .
		navItem('http://www.usgs.gov/faq/?q=categories/9843',
				'Frequently Asked Questions');

	// print side_nav_footer();
?>
