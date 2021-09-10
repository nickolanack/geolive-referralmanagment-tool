var SpatialProject = (function() {



	var SpatialProject = new Class({
		implements:[Events],

		InitMapLayers: function(map) {

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

						var layer = new ProjectLayer(map, {
							url: url,
							name: project.getName(),
							group: project.getBaseMapLayerType(),

							//project:item,
							id: "project-" + project.getId() + '-' + i + '',
							projectAttributes: project.getDatasetAttributes(i)
						});

						map.getLayerManager().addLayer(layer);

					});



				});


			});


		},


		InitMapTile: function(tile, control, map) {

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

		},


		ItemsSpatial: function(item, group) {

			if (!group) {
				group = "selection";
			}


			var spatial = [];
			spatial = spatial.concat(item.getSpatialDocuments());

			if (item.getProjectObjects) {
				item.getProjectObjects().forEach(function(p) {
					spatial = spatial.concat(p.getSpatialDocuments().map(function(url, i) {
						return {
							url: url,
							id: "project-" + p.getId() + '-' + i + '',
							name: p.getName(),
							projectAttributes: p.getDatasetAttributes(i)
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
					group: group,
					id: "project-" + item.getId() + '-' + i + '',
					name: item.getName(),
					projectAttributes: item.getDatasetAttributes(i)
				}, options);



			});

			return spatial;


		},

		InitMainMap: function() {


			this._clearCurrentProject();

			window.CurrentMapType = "MainMap";
			window.GetSpatialFiles = function() {



				var items = ProjectSelection.getProjects();
				var list = [];

				items.forEach(function(item) {

					var spatial = SpatialProject.ItemsSpatial(item);
					list = list.concat(spatial);

				});

				return list;

			}


			return null;



		},

		


		InitCurrentProject: function(item) {


			this._setCurrentProject(item);


			window.CurrentMapType = "ProjectMap";
			window.CurrentMapItem = item;
			window.GetSpatialFiles = function() {


				var spatial = item.getSpatialDocuments();

				if (item.getProjectObjects) {
					item.getProjectObjects().forEach(function(p) {
						spatial = spatial.concat(p.getSpatialDocuments().map(function(url, i) {
							return {
								url: url,
								id: "project-" + p.getId() + '-' + i + '',
								name: p.getName(),
								projectAttributes: p.getDatasetAttributes(i)
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
						name: item.getName(),
						projectAttributes: item.getDatasetAttributes(i)
					}, options);



				});
			}

			return null;

		},


		FormatListItemViewModulesScript:function(list, listItem, uiview, callback){


			 console.log('format list modules');

			console.log(list);

			var adminBtns=[];

			if(list.content[list.content.length-1].getIdentifier()=="admin-btn"){
				adminBtns.push(list.content.pop());
			}
			


			list.content=([
			        new ElementModule('div',{
			        	"class":"field-value-module inline btn",
			            html:'toggle',
			            events:{
			                click:function(){
			                    console.log(toggle)
			                }
			            }
			        })
			    ]).concat(list.content,[
			        new ElementModule('div',{
			        	"class":"field-value-module inline btn",
			            html:'remove',
			            events:{
			                click:function(){
			                    console.log(toggle)
			                }
			            }
			        }),
			        new ElementModule('div',{
			        	"class":"field-value-module inline btn",
			            html:'config',
			            events:{
			                click:function(){
			                    console.log(toggle)
			                }
			            }
			        })
			        
			    
			    ], adminBtns);



			return list
	       


		},

		GetProjectList: function(item, callback) {

			if (item.getProjectList) {
				item.getProjectList(callback);
				return;
			}

			if (item instanceof Project) {

				(new ProjectList({
					"label": "Collection Datasets",
					"showCreateBtn": true,
					projects: function(callback) {
						callback([item].concat(item.getProjectObjects()));
					}
				})).getProjectList(callback);

				return;
			}

			(new ProjectList({
				"label": "Collection Datasets",
				"showCreateBtn": true,
				projects: function(callback) {
					callback(ProjectSelection.getProjects());
				}
			})).getProjectList(callback);

			return;

		},

		_clearCurrentProject:function(item){
			this._item=null;
			this.fireEvent('mainMap');

		},

		_setCurrentProject:function(item){
			this._item=item;
			this.fireEvent('projectMap',[item]);

		}


	});

	return new SpatialProject();

})()