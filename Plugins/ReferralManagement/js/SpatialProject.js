var SpatialProject = (function() {



	var SpatialProject = new Class({});


	SpatialProject.InitMapLayers = function(map) {

		ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

			var projects = team.getProjects().filter(function(p) {
				return p.isDataset() && p.isBaseMapLayer();
			});

			projects.map(function(project) {

				var spatial = project.getSpatialDocuments();

				spatial.forEach(function(url, i) {


					if (window.GetSpatialFiles().map(function(opt) {
							return opt.url
						}).indexOf(url) >= 0) {
						return;
					}

					var layer = ProjectLayer.MakeProjectLayer(map, {
						url: url,
						name: project.getName(),
						group: project.getBaseMapLayerType(),

						//project:item,
						id: "project-" + project.getId() + '-' + i + ''
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
				SpatialDocumentPreview.show([]);
			}
		}

	};

	SpatialProject.InitMainMap = function() {

		window.GetSpatialFiles = function() {



			var items = ProjectSelection.getProjects();
			var list = [];

			items.forEach(function(item) {



				var spatial = [];
				spatial = spatial.concat(item.getSpatialDocuments());

				if (item.getProjectObjects) {
					item.getProjectObjects().forEach(function(p) {
						spatial = spatial.concat(p.getSpatialDocuments().map(function(url, i) {
							return {
								url: url,
								id: "project-" + p.getId() + '-' + i + '',
								name: p.getName()
							}
						}));
					});
				}



				spatial = spatial.map(function(spatial, i) {

					var url = spatial;
					var options = {};
					if (spatial.url) {
						options = spatial;
					}


					return Object.append({
						url: url,
						//project:item,
						group: "selection",
						id: "project-" + item.getId() + '-' + i + '',
						name: item.getName()
					}, options);



				});


				list=list.concat(spatial);

			});

			return list;

		}


		return null;



	}


	SpatialProject.InitCurrentProject = function(item) {


		window.GetSpatialFiles = function() {


			var spatial = item.getSpatialDocuments();

			if (item.getProjectObjects) {
				item.getProjectObjects().forEach(function(p) {
					spatial = spatial.concat(p.getSpatialDocuments().map(function(url, i) {
						return {
							url: url,
							id: "project-" + p.getId() + '-' + i + '',
							name: p.getName()
						}
					}));
				});
			}

			return spatial.map(function(spatial, i) {

				var url = spatial;
				var options = {};
				if (spatial.url) {
					options = spatial;
				}


				return Object.append({
					url: url,
					//project:item,
					group: "project",
					id: "project-" + item.getId() + '-' + i + '',
					name: item.getName()
				}, options);



			});
		}

		return null;

	}

	return SpatialProject;

})()