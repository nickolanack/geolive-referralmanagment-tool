var ProjectFiles = (function() {

	var concat = function(items, fn) {
			return Array.prototype.concat.apply([], items.map(fn));
		}


	var ProjectFile=new Class({

		Implements:[
			ItemNavigationTagLinks
		],
		initialize:function(url, option){

			this._url=url;
			this._option=Object.append({}, option);

			if(this._option.project&&(!(this._option.project instanceof Project))){
				console.error('Project option, (options.project) is not a Project!');
			}

		},
		getNavigationTags:function(){

			var tags=[new FileTag(this)];
			if(this._option.project){
				tags.push(this._option.project);
			}
			return tags;
		},

		getUrl:function(){
			
			return this._url;
		},
		getDownloadUrl:function(){
			if(this._option.project){
				return '/projectfiles/'+this._option.project.getId()+'/'+(this._url.split('/').pop());
			}
			return this._url;
		}

	});


	var FileTag=new Class({
		initialize:function(file){
			this._file=file;
		},
		getType:function(){
			return this._file._option.type;
		},
		getName:function(){
			return this.getType();
		},
		navigate:function(){},
		getNavigationTags:function(){

			var tags=[];
			if(this._file._option.project){
				tags.push(this._file._option.project);
			}
			return tags;
		},
	})



	var ProjectFiles = new Class({



		getLetters:function(projects){
			if(projects instanceof Project||projects instanceof Proposal){
				projects=[projects];
			}
			return concat(projects, function(project) {
				return project.getProjectLetterDocuments().map(function(url){
					return new ProjectFile(url, {type:"letters", project:project})
				});
			});
		},

		getPermits:function(projects){
			if(projects instanceof Project||projects instanceof Proposal){
				projects=[projects];
			}
			return concat(projects, function(project) {
				return project.getPermitDocuments().map(function(url){
					return new ProjectFile(url, {type:"permits", project:project})
				});
			});
		},

		getAgreements:function(projects){
			if(projects instanceof Project||projects instanceof Proposal){
				projects=[projects];
			}
			return concat(projects, function(project) {
				return project.getAgreementDocuments().map(function(url){
					return new ProjectFile(url, {type:"agreements", project:project})
				});
			});
		},


		getDocuments:function(projects){
			if(projects instanceof Project||projects instanceof Proposal){
				projects=[projects];
			}
			var files= concat(projects, function(project) {
				return project.getAdditionalDocuments().map(function(url){
					return new ProjectFile(url, {type:"documents", project:project})
				});
			});

			var me=this;
			if(true){
				files=files.concat(
					me.getLetters(projects),
					me.getPermits(projects),
					me.getAgreements(projects),
					me.getOther(projects),
				);
			}

			return files;
		},

		getSpatial:function(projects){
			if(projects instanceof Project||projects instanceof Proposal){
				projects=[projects];
			}
			return concat(projects, function(project) {
				return project.getSpatialDocuments().map(function(url){
					return new ProjectFile(url, {
						type:"spatial", project:project
					})
				});
			});
		},

		getOther:function(projects){
			if(projects instanceof Project||projects instanceof Proposal){
				projects=[projects];
			}
			return concat(projects, function(project) {
				return project.getAttachments().map(function(url){
					return new ProjectFile(url, {type:"other-documents", project:project})
				});
			});
		},



		getTaskFiles:function(projects){
			if(projects instanceof Project||projects instanceof Proposal){
				projects=[projects];
			}
			var list= concat(projects, function(project) {


				var files = [];

				project.getTasks().filter(function(t) {
					return t.hasAttachments();
				}).map(function(task){
					
					return task.getFiles().map(function(url){
						return new ProjectFile(url, {type:"files-tasks", project:project, task:task})
					});

				}).filter(function(list){
					return list.length>0;
				}).forEach(function(list){

					files=files.concat(list);
				});

				return files;
			});

			return list;
			
		},





		



		getFileName:function(item, callback){



			var file=item.file||item.id||item;
			if(item.getUrl){
				file=item.getUrl();
			}

			if(file.html){
			    file=Proposal.ParseHtmlUrls(file.html)[0];
			}

			if(callback){
				(new AjaxControlQuery(CoreAjaxUrlRoot, 'file_metadata', {
								'file': file,
								'show': ['iconsetDetails']
							})).addEvent('onSuccess', function(response) {



							    callback(response.metadata.name);
							}).execute();

			}


			return file.split("/").pop();
		},

		getAllProjectFileSections: function(project) {



			var me=this;
			var projects = ProjectTeam.CurrentTeam().getProjects();
			project = projects[0];


			

			var sections = [{
					label: "Letters",
					"parentClassName": "files-letters",
					formatSectionModule: function(module) {

						module.getElement().addClass('letters');


					},
					getItems: function() {
						me.getLetters(projects);
					},
					removeAttachment: function(file) {
						//return project.removeAttachment(file);
					}
				}, {
					label: "Permits",
					"parentClassName": "files-permits",
					formatSectionModule: function(module) {

						module.getElement().addClass('permits');

					},
					getItems: function() {
						return me.getPermits(projects);
					},
					removeAttachment: function(file) {
						//return project.removeAttachment(file);
					}
				}, {
					label: "Agreements",
					"parentClassName": "files-agreements",
					formatSectionModule: function(module) {

						module.getElement().addClass('agreements');


					},
					getItems: function() {
						return me.getAgreements(projects);
					},
					removeAttachment: function(file) {
						//return project.removeAttachment(file);
					}
				}, {
					label: "Documents",
					"parentClassName": "files-documents",
					formatSectionModule: function(module) {

						module.getElement().addClass('documents');


					},
					getItems: function() {
						return me.getDocuments(projects);
					},
					removeAttachment: function(file) {
						//return project.removeAttachment(file);
					}
				}, {
					label: "Spatial",
					"parentClassName": "files-spatial",
					formatSectionModule: function(module) {

						module.getElement().addClass('spatial');
						module.getElement().addEvent('click', function(e) {
							e.stop();

							//module.application.getNamedValue('projectMenuController').navigateTo("Map", "Project");

						});

					},
					getItems: function() {
						return me.getSpatial(projects);
					},
					removeAttachment: function(file) {
						//return project.removeAttachment(file);
					}
				}, {
					label: "Other documents",
					"parentClassName": "files-other",
					formatSectionModule: function(module) {

						module.getElement().addClass('other-documents');

					},
					getItems: function() {
						return me.getOther(projects)
					},
					removeAttachment: function(file) {
						//return project.removeAttachment(file);
					}

				}



			];

			var taskFiles = me.getTaskFiles(projects);

			if (taskFiles.length) {
				sections.push({
					label: "Attachments from tasks",
					"parentClassName": "files-tasks",
					formatSectionModule: function(module) {

					},
					getItems: function() {
						return taskFiles;
					},
					removeAttachment: function(file) {
						throw 'remove from task';
					}
				});
			}


			return sections;


		},

		addDropTarget:function(module, project, options){

			if(AppClient.getUserType()==="guest"){
				return null;
			}


			options=Object.append({
				moduleClass:'other-documents',
				fileTypes:["document", "image", "audio", "video"],
				targetClass:'drop-documents',
				method:'addAttachment'
			}, options);


			module.getElement().addClass(options.moduleClass);

			(new AjaxFileUploader(module.getElement(), {
				types: options.fileTypes,
				selectFile: function(fileinfo, type) {
					console.log(fileinfo);
					console.log(type);

					project[options.method](fileinfo);
					module.redraw();
				},
				addElement: true,
				addInput: true,
				dragareaClassName: options.targetClass
			})).getDragArea().appendChild(new Element('span', {
				"class": "add-btn"
			}));
		},

		getProjectFileSections: function(project) {

			var me=this;

			var sections = [{
				    getProject:function(){
				    	return project;
				    },
					label: "Letters",
					"parentClassName": "files-letters",
					formatSectionModule: function(module) {


						me.addDropTarget(module, project, {
							moduleClass:'letters',
							fileTypes:["document"],
							targetClass:'drop-letters',
							method:'addLetter'
						});

					},
					getItems: function() {
						return project.getProjectLetterDocuments();
					},
					removeAttachment: function(file) {
						return project.removeAttachment(file);
					}
				}, {
					getProject:function(){
				    	return project;
				    },
					label: "Permits",
					"parentClassName": "files-permits",
					formatSectionModule: function(module) {


						me.addDropTarget(module, project, {
							moduleClass:'permits',
							fileTypes:["document"],
							targetClass:'drop-permits',
							method:'addPermit'
						});

					},
					getItems: function() {
						return project.getPermitDocuments();
					},
					removeAttachment: function(file) {
						return project.removeAttachment(file);
					}
				}, {
					getProject:function(){
				    	return project;
				    },
					label: "Agreements",
					"parentClassName": "files-agreements",
					formatSectionModule: function(module) {


						me.addDropTarget(module, project, {
							moduleClass:'agreements',
							fileTypes:["document"],
							targetClass:'drop-agreements',
							method:'addAgreement'
						});


					},
					getItems: function() {
						return project.getAgreementDocuments();
					},
					removeAttachment: function(file) {
						return project.removeAttachment(file);
					}
				}, {
					getProject:function(){
				    	return project;
				    },
					label: "Documents",
					"parentClassName": "files-documents",
					formatSectionModule: function(module) {


						me.addDropTarget(module, project, {
							moduleClass:'documents',
							fileTypes:["document"],
							targetClass:'drop-documents',
							method:'addAdditionalDocument'
						});

					},
					getItems: function() {
						return project.getAdditionalDocuments();
					},
					removeAttachment: function(file) {
						return project.removeAttachment(file);
					}
				}, {
					getProject:function(){
				    	return project;
				    },
					label: "Spatial",
					"parentClassName": "files-spatial",
					formatSectionModule: function(module) {

						module.getElement().addEvent('click', function(e) {
							e.stop();

							//module.application.getNamedValue('projectMenuController').navigateTo("Map", "Project");
						});


						me.addDropTarget(module, project, {
							moduleClass:'spatial',
							fileTypes:["document"],
							targetClass:'drop-spatial',
							method:'addSpatial'
						});

					},
					getItems: function() {
						return project.getSpatialDocuments();
					},
					removeAttachment: function(file) {
						return project.removeAttachment(file);
					}
				}, {
					getProject:function(){
				    	return project;
				    },
					label: "Other documents",
					"parentClassName": "files-other",
					formatSectionModule: function(module) {

						me.addDropTarget(module, project, {
							moduleClass:'other-documents',
							fileTypes:["document", "image", "audio", "video"],
							targetClass:'drop-documents',
							method:'addAttachment'
						});
					},
					getItems: function() {
						return project.getAttachments();
					},
					removeAttachment: function(file) {
						return project.removeAttachment(file);
					}

				}



			];

			var taskFiles = project.getTasks().filter(function(t) {
				return t.hasAttachments();
			});
			if (taskFiles.length) {
				sections.push({
					getProject:function(){
				    	return project;
				    },
					label: "Attachments from tasks",
					"parentClassName": "files-tasks",
					formatSectionModule: function(module) {

					},
					getItems: function() {
						var files = [];
						project.getTasks().filter(function(t) {
							return t.hasAttachments();
						}).forEach(function(task) {
							files = files.concat(task.getFiles());
						})

						return files;
					},
					removeAttachment: function(file) {
						throw 'remove from task';
					}
				});
			}


			return sections;


		},

		getFileModule: function(file) {

			/*File*/


			/*
			 figure out file type and render module
			*/

			//var file = item;
			if (typeof file !== "string") {

				//just to support passing object with id or file param. instead of a plain file path.

				if (typeof file.id == "string") {
					file = file.id;
				}
				if (typeof file.file == "string") {
					file = file.file;
				}
				if (typeof file.html == "string") {
					var urls = Proposal.ParseHtmlUrls(file.html);
					if (urls.length) {
						file = urls[0];
					}
				}

				if(file.getUrl){
					file=file.getUrl();
				}
			}

			if (typeof file == "string") {
				var mod = new ElementModule('div', {
					"class": "file-container"
				});
				var container = mod.getElement();

				var type = JSTextUtilities.ParseUrlMime(file);
				if (type) {
					type = type.split('/')[0];

				} else {
					type = 'document';
				}

				var typeName='unknown';
				
				if (!typeName) {
					typeName = type;
				}

				if ((['audio', 'video', 'image', 'document']).indexOf(type) >= 0) {







					if (type == 'audio') {
						(new AudioModule({
							textQuery: function(callback) {
								callback(file);
							},
							"class": typeName
						})).load(null, container, null);
					}
					if (type == 'video') {
						(new VideoModule({
							textQuery: function(callback) {
								callback(file);
							},
							"class": typeName,
							width: 100,
							height: 100
						})).load(null, container, null);
					}
					if (type == 'image') {
						(new ImageModule({
							textQuery: function(callback) {
								callback(file);
							},
							"class": typeName,
							width: 100,
							height: 100,
							setBackgroundImage: true
						})).load(null, container, null);
					}
					if (type == 'document') {
						(new DocumentModule({
							textQuery: function(callback) {
								callback(file);
							},
							"class": typeName,
							width: 100,
							height: 100,
							download: false,
							showImage: false
						})).load(null, container, null);
					}

					return mod;
				}



			}



			return null;


		},
		fileEditButtons: function(item, application, listItem) {



			if(AppClient.getUserType()==="guest"){
				return null;
			}



			var FileUpdateRequest = new Class({
				Extends: AjaxControlQuery,
				initialize: function(id, data) {

					this.parent(CoreAjaxUrlRoot, "update_file", {
						plugin: "Filesystem",
						file: id,
						data: data
					});
				}
			});


			var FileItem = new Class({
				Extends: MockDataTypeItem,
				setTitle: function(t) {
					this._title = t;
				},
				save: function(cb) {

					if (!this._title) {
						callback(true);
						return;
					}

					var file = this.getFile();
					(new FileUpdateRequest(file, {
						title: this._title
					})).addEvent('success', function(resp) {
						callback(true);
					}).execute();
				}
			});






			return [

				ItemNavigationTagLinks.CreateNavigationTagListModule(
					((listItem instanceof ProjectFile)?listItem:new ProjectFile(
						listItem.getUrl?listItem.getUrl():listItem, 
						{
							type:"", 
							project:(item.getProject?item.getProject():item)
						})),
					["ReferralManagement.proposal" /*, "permits", "letters", "agreements", "spatial"*/]),

				new ElementModule('button', {
					"class": "remove-btn",
					events: {
						click: function() {
							if (confirm("Are you sure you want to remove this file")) {
								if(listItem.remove){
									listItem.remove();
								}
								item.removeAttachment(listItem.getUrl?listItem.getUrl():listItem);
							};
						}
					}
				}),
				new ElementModule('button', {
					"class": "download-btn",
					events: {
						click: function(e) {

							if(typeof listItem=="string"&&item.getProject){
								window.open(new ProjectFile(listItem, {project:item.getProject()}).getDownloadUrl(), 'Download');
								return;
							}

							window.open(listItem.getDownloadUrl?listItem.getDownloadUrl():listItem, 'Download');
						}
					}
				}),
				(new ModalFormButtonModule(application, new FileItem({
					file: listItem.getUrl?listItem.getUrl():listItem
				}), {
					label: "Edit",
					formName: "fileItemForm",
					formOptions: {
						template: "form"
					},
					hideText: true,
					"class": "edit-btn"
				})).addEvent("show", function() {

				})
			];


		}
	});



	return new ProjectFiles();



})();