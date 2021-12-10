var SpatialProject = (function() {



	var SpatialProject = new Class({
		Implements: [Events],

		InitMapLayers: function(map) {

			this._setMap(map);

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
			var me=this;

			window.CurrentMapType = "MainMap";
			window.GetSpatialFiles = function() {



				var items = ProjectSelection.getProjects();
				var list = [];

				items.forEach(function(item) {

					var spatial = me.ItemsSpatial(item);
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

		FormatListModulesScript:function(module, item){
			 module.addWeakEvent(ProjectSelection, 'change', function(){
			 	module.redraw();
			 });
		},
		FormatListItemViewModulesScript: function(list, listItem, uiview, callback) {


			console.log('format list modules');

			console.log(list);

			var adminBtns = [];

			if (list.content[list.content.length - 1].getIdentifier() == "admin-btn") {
				adminBtns.push(list.content.pop());
			}

			var me = this;

			var visible = true;


			var toggle = new ElementModule('div', {
				"class": "field-value-module inline btn active",
				html: '',
				events: {
					click: function() {

						visible = !visible;
						listItem.getMapLayerIds().forEach(function(lid) {

							if (visible) {
								me._map.getLayerManager().getLayer(lid).show();
								toggle.getElement().addClass('active');
								return;
							}
							me._map.getLayerManager().getLayer(lid).hide();
							toggle.getElement().removeClass('active');

						});
					}
				}
			});
			toggle.appendChild(new Element('span', {"class":'indicator-switch'}))

			var editBtn=null;
			editBtn=new ElementModule('div', {
					"class": "field-value-module inline btn",
					html: '',
					events: {
						click: function() {
							var lids=listItem.getMapLayerIds();


							if(lids.length!=1){
								return;
							}

							me.editLayer(me._map, me._map.getLayerManager().getLayer(lids[0]).getOptions());
									
						}
					}
				});

			editBtn.appendChild(new Element('span',{"class":"btn inline-edit"}));
			



			var removeBtn=null;
			if(me._item!==listItem){
				removeBtn=new ElementModule('div', {
						"class": "field-value-module inline btn",
						html: '',
						events: {
							click: function() {
								ProjectSelection.removeProject(listItem);
								//uiview.parentUIView.redraw();


								listItem.getMapLayerIds().forEach(function(lid) {
									try{
										me._map.getLayerManager().removeLayer(me._map.getLayerManager().getLayer(lid));
									}catch(e){
										console.error(e);
									}
								});
					
							}
						}
					});
				removeBtn.appendChild(new Element('span',{"class":"btn inline-remove"}))
			}




			list.content = ([toggle]).concat(list.content, [
				removeBtn,
				editBtn


			], adminBtns);



			return list



		},


		editLayer:function(map, layerObject){


			var formName="projectLayerSettings";

            var projectIdString=layerObject.id.split("-");
            var layerIndex=parseInt(projectIdString.pop());
            var projectId=parseInt(projectIdString.pop());

            ProjectTeam.CurrentTeam().getProject(projectId,function(project){
                var wizardTemplate = map.getDisplayController().getWizardTemplate(formName);
                if ((typeof wizardTemplate) != 'function') {

                    if(window.console&&console.warn){
                        console.warn('Expected named wizardTemplate: '+formName+', to exist');
                    }

                }
                var modalFormViewController =  new PushBoxModuleViewer(map, {});


                var data={
                    mutable:true,
                    showIcons:true,
                    showLabels:false,
                    showAttributes:true,
                    renderTiles:false,
                    lineColor:"#000000",
                    fillColor:"#000000",
                    lineOpacity:1,
                    fillOpacity:0.5,
                    lineWidth:1,
                    description:"",
                };

                if(layerObject.projectAttributes&&layerObject.projectAttributes.metadata){
                    data=ObjectAppend_(data, layerObject.projectAttributes.metadata);
                }


                var newItem= new MockDataTypeItem(data);
                var wizard = wizardTemplate(newItem, {});
                wizard.buildAndShow(modalFormViewController, {template:"form"}); 
                wizard.addEvent('complete', function() {

                    var data = wizard.getData();
                    console.log(data);
                    project.setDatasetMetadata(data, layerIndex);

                    //update current map

                });

            });


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

		_setMap: function(map) {
			this._map = map;
			this.fireEvent('map', ['map']);
		},

		_clearCurrentProject: function(item) {
			this._item = null;
			this.fireEvent('mainMap');

		},

		_setCurrentProject: function(item) {
			this._item = item;
			this.fireEvent('projectMap', [item]);

		}


	});

	return new SpatialProject();

})()