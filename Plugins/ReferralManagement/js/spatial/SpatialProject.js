var SpatialProject = (function() {

	var current=document.currentScript.src;
	var userFunctionWorker=current.replace('SpatialProject.js', 'SpatialProjectWorker.js');

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
			var me = this;

			window.CurrentMapType = "MainMap";
			window.GetSpatialFiles = function() {

				return me.getSelectionLayers();

			}


			return null;



		},



		InitCurrentProject: function(item) {


			this._setCurrentProject(item);


			window.CurrentMapType = "ProjectMap";
			window.CurrentMapItem = item;
			var me = this;
			window.GetSpatialFiles = function() {

				return me.getProjectLayers(item).concat(me.getSelectionLayers())

			}

			return null;

		},

		getProjectLayers: function(item) {
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
		},

		getSelectionLayers: function() {

			var items = ProjectSelection.getProjects();
			var list = [];
			var me = this;
			items.forEach(function(item) {

				var spatial = me.ItemsSpatial(item);
				list = list.concat(spatial);

			});

			return list;
		},

		FormatListModulesScript: function(module, item) {
			module.addWeakEvent(ProjectSelection, 'change', function() {
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
				"class": "field-value-module inline btn active toggle",
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
			toggle.appendChild(new Element('span', {
				"class": 'indicator-switch'
			}))



			var editBtn = null;
			editBtn = new ElementModule('div', {
				"class": "field-value-module inline btn",
				html: '',
				events: {
					click: function() {
						var lids = listItem.getMapLayerIds();


						if (lids.length != 1) {
							return;
						}

						me.editLayer(me._map, me._map.getLayerManager().getLayer(lids[0]).getOptions());

					}
				}
			});

			editBtn.appendChild(new Element('span', {
				"class": "btn inline-edit"
			}));


			AppClient.authorize('write', {
				id: listItem.getId(),
				type: listItem.getType()
			}, function(access) {
				if (!access) {
					editBtn.getElement().setStyle('display', 'none');
				}
			});

			var removeBtn = null;
			if (me._item !== listItem) {
				removeBtn = new ElementModule('div', {
					"class": "field-value-module inline btn",
					html: '',
					events: {
						click: function() {

							//TODO list.getItem().removeProject

							ProjectSelection.removeProject(listItem);
							//uiview.parentUIView.redraw();


							listItem.getMapLayerIds().forEach(function(lid) {
								try {
									me._map.getLayerManager().removeLayer(me._map.getLayerManager().getLayer(lid));
								} catch (e) {
									console.error(e);
								}
							});

						}
					}
				});
				removeBtn.appendChild(new Element('span', {
					"class": "btn inline-remove"
				}))
			}


			var items = ([toggle]).concat(list.content);

			if (AppClient.getUserType() != "guest") {
				items = items.concat([removeBtn, editBtn]);
			}

			items = items.concat(adminBtns);

			list.content = items;



			callback(list);



		},


		getLayerOptions: function(options, map) {



			var markerOptions = {
				icon: 'https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0',
				showLabels: false,
				clickable: false,
			};
			var lineOptions = {

			};
			var polygonOptions = {};

			if (options.projectAttributes && options.projectAttributes.metadata) {


				var metadata = options.projectAttributes.metadata;
				if (metadata.description) {
					JSTextUtilities.ParseImages(metadata.description).forEach(function(item) {
						if (item.type.indexOf("image") >= 0) {
							options.icon = item.url;
							markerOptions.icon = item.url;
						}
					});
				}

				if (typeof metadata.showLabels == "boolean") {
					markerOptions.showLabels = metadata.showLabels;
				}

				if (typeof metadata.lineColor == "string") {
					lineOptions.lineColor = metadata.lineColor;
					polygonOptions.lineColor = metadata.lineColor;
				}

				if (typeof metadata.lineWidth != "undefined") {

					var lineWidth = parseFloat(metadata.lineWidth);
					lineWidth = Math.min(Math.max(0, lineWidth), 5);

					lineOptions.lineWidth = lineWidth;
					polygonOptions.lineWidth = lineWidth;
				}

				if (typeof metadata.lineOpacity != "undefined") {

					var lineOpacity = parseFloat(metadata.lineOpacity);
					lineOpacity = Math.min(Math.max(0, lineOpacity), 1);

					lineOptions.lineOpacity = lineOpacity;
					polygonOptions.lineOpacity = lineOpacity;

				}

				if (typeof metadata.fillColor == "string") {

					polygonOptions.polyColor = metadata.fillColor;
				}

				if (typeof metadata.fillOpacity != "undefined") {

					var fillOpacity = parseFloat(metadata.fillOpacity);
					fillOpacity = Math.min(Math.max(0, fillOpacity), 1);
					polygonOptions.polyOpacity = fillOpacity;

				}

				if (metadata.renderTiles === true) {
					options.parseBehavior = 'tile';

				}

				if(metadata.script){

					var worker =new Worker(userFunctionWorker);
					worker.postMessage(metadata.script);
					var queue=[];


					worker.onmessage=function(e){
						var args=queue.shift();
						args[3].call(null, e.data);

						if(queue.length>0){
							var next=queue[0];
							worker.postMessage([next[0], next[1], next[2]]);
						}

					}


					map.once('remove',function(){
						worker.terminate();
						delete worker.onmessage;
						delete options.script;
						worker=null;
					});

					//=(new Function('return function(feature, type, index, callback){ '+"\n"+metadata.script+"\n"+'}')).call(null);

					options.script=function(/*feature, type, index, callback*/){

						
						queue.push(arguments);
						if(queue.length==1){
							worker.postMessage([arguments[0], arguments[1], arguments[2]])
						}

					};
				}

			}


			var layerOptions = ObjectAppend_(options, {
				markerOptions: markerOptions,
				polygonOptions: polygonOptions,
				lineOptions: lineOptions
			});

			return layerOptions;

		},


		editLayer: function(map, layerObject) {


			var formName = "projectLayerSettings";

			var projectIdString = layerObject.id.split("-");
			var layerIndex = parseInt(projectIdString.pop());
			var projectId = parseInt(projectIdString.pop());

			ProjectTeam.CurrentTeam().getProject(projectId, function(project) {
			
				var data = {
					mutable: true,
					showIcons: true,
					showLabels: false,
					showAttributes: true,
					renderTiles: false,
					lineColor: "#000000",
					fillColor: "#000000",
					lineOpacity: 1,
					fillOpacity: 0.5,
					lineWidth: 1,
					description: "",
					script:"",
					options:{}
				};

				if (layerObject.url) {
					data.url = layerObject.url;
				}

				if (layerObject.projectAttributes && layerObject.projectAttributes.metadata) {
					data = ObjectAppend_(data, layerObject.projectAttributes.metadata);
				}


				var layerDataItem = new MockDataTypeItem(data);



				var dialog = (new UIModalDialog(ReferralManagementDashboard.getApplication(), layerDataItem, {
					"formName": formName,
					"formOptions": {
						template: "form"
					}
				})).on('complete', function() {

					var data = dialog.getWizard().getData();
					console.log(data);
					project.setDatasetMetadata(data, layerIndex);

					map.getLayerManager().getLayer(layerObject.id)


				}).show();


				// var modalFormViewController =  new PushBoxModuleViewer(map, {});
				// var wizard = wizardTemplate(layerDataItem, {});
				// wizard.buildAndShow(modalFormViewController, 
				// 	template:"form"
				// }); 
				// wizard.addEvent('complete', function() {

				//     var data = wizard.getData();
				//     console.log(data);
				//     project.setDatasetMetadata(data, layerIndex);

				//     //update current map

				// });

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
						callback(
							([item].concat(item.getProjectObjects())).filter(function(p) {
								return p.getSpatialDocuments().length > 0
							}).concat(ProjectSelection.getProjects().filter(function(p) {
								return p.getSpatialDocuments().length > 0
							}))
						);
					}
				})).getProjectList(callback);

				return;
			}

			(new ProjectList({
				"label": "Collection Datasets",
				"showCreateBtn": true,
				projects: function(callback) {
					callback(ProjectSelection.getProjects().filter(function(p) {
						return p.getSpatialDocuments().length > 0
					}));
				}
			})).getProjectList(callback);

			return;

		},

		_setMap: function(map) {
			var me = this;
			me._map = map;
			me.fireEvent('map', ['map']);


			map.once('remove', function() {
				if (me._map == map) {
					me._map = null;
				}
			});
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