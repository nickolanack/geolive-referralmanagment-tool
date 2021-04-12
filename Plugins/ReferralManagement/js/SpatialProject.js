var SpatialProject=(function(){



	var SpatialProject=new Class({});


	SpatialProject.InitMapLayers = function(map) {


	};


	SpatialProject.InitMapTile = function(tile, control, map) {

		SpatialDocumentPreview.setTile(tile, control);
		SpatialDocumentPreview.setMap(map);


		var getFiles = window.GetSpatialFiles || window.parent.GetSpatialFiles
		if (getFiles) {
			var files = getFiles();
			if (files.length) {
				SpatialDocumentPreview.show(files);
			} else {
				tile.disable();
			}
		}

	};

	return SpatialProject;

})()