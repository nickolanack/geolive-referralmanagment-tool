var SpatialProject=(function(){



	var SpatialProject=new Class({});


	SpatialProject.InitMapLayers = function(map) {

		ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
			
			var projects=team.getProjects().filter(function(p){ return p.isDataset()&&p.isBaseMapLayer(); });

			projects.map(function(project){

				var spatial=project.getSpatialDocuments();

				spatial.forEach(function(url){


					if(window.GetSpatialFiles().indexOf(url)>=0){
						return;
					}

					var layer = ProjectLayer.MakeProjectLayer(map, {
						url: url,
						name:project.getName(),
						group:project.getBaseMapLayerType()
					});

					map.getLayerManager().addLayer(layer);

				});

				

			});


		});


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