var SpatialProject = (function() {



	var SpatialProject = new Class({});


	SpatialProject.InitMapLayers = function(map) {

		ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

			var projects = team.getProjects().filter(function(p) {
				return p.isDataset() && p.isBaseMapLayer();
			});

			projects.map(function(project) {

				var spatial = project.getSpatialDocuments();

				spatial.forEach(function(url) {


					if (window.GetSpatialFiles().indexOf(url) >= 0) {
						return;
					}

					var layer = ProjectLayer.MakeProjectLayer(map, {
						url: url,
						name: project.getName(),
						group: project.getBaseMapLayerType()
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

	SpatialProject.InitMainMap() {

		window.GetSpatialFiles = function() {


			return [];

		}


		return null;

		/*

		var iframe=new ElementModule('iframe',{
		    "src":"https://wabun.geolive.ca/wabun-map/embed",
		    "height":"100%",
		    "width":"100%",
		    "frameborder":"0",
		    "styles":{"min-height":"400px"},
		    "allowfullscreen":true
		});
		//return '<iframe src="https://wabun.geolive.ca/wabun-map/embed" width="100%" height="100%" frameborder="0" style="min-height:700px;"></iframe>';

		var setSize=function(){
		    var size=window.getSize();
		    iframe.getElement().setStyle('height',size.y+"px");
		    
		};
		window.addEvent('resize', setSize);
		setSize();

		return iframe;



 		*/



	}


	SpatialProject.InitCurrentProject = function(item) {


		window.GetSpatialFiles = function() {


			var spatial = item.getSpatialDocuments();

			if (item.getProjectObjects) {
				item.getProjectObjects().forEach(function(i) {
					spatial = spatial.concat(i.getSpatialDocuments());
				});
			}

			return spatial;
		}

		return null;

		/*

		var iframe = new ElementModule('iframe', {
			"src": "https://wabun.geolive.ca/wabun-map/embed",
			"height": "100%",
			"width": "100%",
			"frameborder": "0",
			"styles": {
				"min-height": "700px"
			},
			"allowfullscreen": true
		});
		//return '<iframe src="https://wabun.geolive.ca/wabun-map/embed" width="100%" height="100%" frameborder="0" style="min-height:700px;"></iframe>';



		//return '<iframe src="https://wabun.geolive.ca/wabun-map/embed" width="100%" height="100%" frameborder="0" style="min-height:700px;"></iframe>';

		var setSize = function() {
			var size = window.getSize();
			iframe.getElement().setStyle('height', size.y + "px");

		};
		window.addEvent('resize', setSize);
		setSize();

		return iframe;
		*/
	}

	return SpatialProject;

})()