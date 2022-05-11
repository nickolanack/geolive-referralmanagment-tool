


var layersDl=[


	105, 106, 107, 108,
	109, 110, 111
]

layersDl.forEach(function(lid){


	window.open(
		'https://wabun.geoforms.ca/app/nickolanack/php-core-app/core.php?format=ajax&iam=administrator&task=layer_display&k2xr8l5b&json={"layerId":'+lid+',"format":"kml"}',
		'_blank'

		);
});

