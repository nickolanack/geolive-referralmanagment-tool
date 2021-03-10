var Project = (function() {

	var SaveProposalQuery = ProjectQueries.SaveProposalQuery;
	var AddDocumentQuery = ProjectQueries.AddDocumentQuery;
	var RemoveDocumentQuery = ProjectQueries.RemoveDocumentQuery;
	var FlagProposalQuery = ProjectQueries.FlagProposalQuery;



	var Project = new Class({
		Extends: DataTypeObject,
		Implements: [
			Events,
			ItemUsersCollection,
			ItemProjectsCollection,
			ItemTasksCollection,
			ItemPending,
			ItemArchive,
			ItemDeadline
		],
		initialize: function(id, data) {
			var me = this;
			me.type = "ReferralManagement.proposal";

			if (id && id > 0) {
				me._id = id;
			}
			me._team = [];


			this._initUsersCollection();
			this._initProjectsCollection();
			this._initTasksCollection();


			if (data) {
				me._setData(data);
			} else {
				data = {};
			}

			if (data.sync) {
				var sub = AjaxControlQuery.Subscribe({
					"channel": 'proposal.' + me.getId(),
					"event": "update"
				}, function(update) {


					console.log('Recieved Update Message');
					console.log(update);

					if (update.updated) {
						update.updated.forEach(function(data) {

							me._setData(data);

						});
					}


				});

				me.addEvent('destroy', function() {
					AjaxControlQuery.Unsubscribe(sub);
				});
			}



		},
		_setData: function(data) {
			var me = this;

			var change = false;

			if (me.data) {
				change = true;
			}

			me.data = data;


			me._updateUsersCollection(data)
			me._updateProjectsCollection(data);
			me._updateTasksCollection(data);

			if (change) {
				me.fireEvent('change');
			}

		},



		destroy: function() {
			var me = this;
			me.fireEvent('destroy')
		},

		isDataset: function() {
			return (this.data.attributes && (this.data.attributes.isDataset === true || this.data.attributes.isDataset === "true"));
		},

		isCollection: function() {
			return !this.isDataset();
		},

		getTags: function() {
			var me = this;
			return [me, me.getCompany()];

		},

		getCompany: function() {
			var me = this;
			return new ProjectClient(-1, {
				name: me.getCompanyName()
			});
		},

		getProjectType: function() {
			var me = this;
			return me.data.attributes.type || ""
		},

		getProjectTypes: function() {
			var me = this;
			return [me.getProjectType()];
		},

		getName: function() {
			var me = this;
			return me.data.attributes.title;
		},

		getDescription() {
			var me = this;
			return me.data.attributes.description;
		},

		setAttributes: function(attributes) {
			var me = this;
			me._attributes = attributes;
		},

		save: function(callback) {

			var me = this;
			me.fireEvent("saving");

			(new SaveProposalQuery({
				id: me._id,
				metadata: {},
				attributes: me._attributes || {},
				team: (me._team || []).map(function(t) {
					return t.getId()
				})
			})).addEvent('success', function(result) {

				if (result.success && result.id) {
					me._id = result.id;
					if (result.data) {
						me._setData(result.data);
					}
					callback(true);
					me.fireEvent("save");
				} else {
					throw 'Failed to save proposal';
				}
			}).execute();

		},
		getCreationDate: function() {
			var me = this;
			return me.data.createdDate;
		},

		getModificationDate: function() {
			var me = this;
			return me.data.modifiedDate;
		},

		getSubmitDate: function() {
			var me = this;
			return me.data.attributes.submissionDate;
		},

		getDeadlineDate: function() {
			var me = this;
			return me.data.attributes.commentDeadlineDate;
		},

		getExpiryDate: function() {
			var me = this;
			return me.data.attributes.expiryDate;
		},
		getProjectName: function() {
			var me = this;
			return me.data.attributes.title;
		},

		isHighPriority: function() {
			var me = this;
			return me.getPriority() == "high";
		},
		getPriority: function() {
			var me = this;
			return me.data.attributes.priority;
		},

		getPriorityNumber: function() {
			var me = this;
			return (["low", "medium", "high"]).indexOf(me.data.attributes.priority);

		},

		getCompanyName: function() {
			var me = this;
			return me.data.attributes.company;
		},

		getClientName: function() {
			var me = this;
			return me.data.attributes.company;
		},

		getProjectUsername: function() {
			var me = this;
			return me.data.userdetails.name;
		},

		getProjectSubmitter: function() {
			var me = this;
			return me.data.userdetails.name + " " + me.data.userdetails.email;
		},

		getProjectSubmitterId: function() {

			var me = this;
			return me.data.userdetails.id;

		},

		getDocuments: function() {
			var me = this;
			return me.getProjectLetterDocuments().concat(me.getPermitDocuments()).concat(me.getAdditionalDocuments()).concat(me.getAgreementDocuments());
		},

		getCommunitiesInvolved: function() {

			var me = this;

			if (me.data && me.data.attributes.firstNationsInvolved) {
				return me.data.attributes.firstNationsInvolved;

			}

			return [];
		},

		hasPosts: function() {
			var me = this;
			return me.numberOfPosts() > 0;
		},
		numberOfPosts: function() {
			var me = this;
			if (!(me.data && me.data.discussion)) {
				return 0;
			}
			return parseInt(me.data.discussion.posts);
		},
		numberOfNewPosts: function() {
			var me = this;
			if (!(me.data && me.data.discussion)) {
				return 0;
			}
			return parseInt(me.data.discussion.new);
		},

		getDiscussionSubscription: function() {
			var me = this;
			return {
				"channel": "discussion." + me.data.discussion.id,
				"event": "post"
			}
		},


		getFiles: function() {



			var me = this;
			return me.getDocuments().concat(me.getSpatialDocuments()).concat(me.getAttachments());
		},

		getStarredDocuments: function() {


			var me = this;
			if (typeof me._getStarredDocuments == "undefined") {

				var docs = me.getDocuments();
				var n = Math.round(Math.random() * docs.length);
				var starred = [];
				for (var i = 0; i < n; i++) {
					var id = Math.floor(Math.random() * docs.length);
					starred = starred.concat(docs.splice(id, 1));

				}
				me._getStarredDocuments = starred;

			}

			return me._getStarredDocuments



		},

		getSpatialDocuments: function() {
			var me = this;

			if (me.data && me.data.attributes.spatialFeatures) {

				return Project.ParseHtmlUrls(me.data.attributes.spatialFeatures);

			}



			return [];

		},
		getAttachments: function() {
			var me = this;

			if (me.data && me.data.attributes.description) {
				var text = me.data.attributes.description;

				return Project.ParseHtmlUrls(me.data.attributes.description);

			}



			return [];
		},

		getAdditionalDocuments: function() {
			var me = this;

			if (me.data && me.data.attributes.documents) {

				return Project.ParseHtmlUrls(me.data.attributes.documents);

			}



			return [];

		},
		getAgreementDocuments: function() {
			var me = this;

			if (me.data && me.data.attributes.agreements) {

				return Project.ParseHtmlUrls(me.data.attributes.agreements);

			}



			return [];

		},
		getProjectLetterDocuments: function() {
			var me = this;

			if (me.data && me.data.attributes.projectLetters) {

				return Project.ParseHtmlUrls(me.data.attributes.projectLetters);

			}

			return [];

		},
		getPermitDocuments: function() {
			var me = this;

			if (me.data && me.data.attributes.permits) {

				return Project.ParseHtmlUrls(me.data.attributes.permits);

			}



			return [];

		},


		addLetter: function(info) {
			var me = this;
			if (me.data && me.data.attributes && info.html) {
				me.data.attributes.projectLetters = (me.data.attributes.projectLetters || "") + info.html;


				(new AddDocumentQuery({
					"id": me.getId(),
					"type": me.getType(),
					"documentType": 'projectLetters',
					"documentHtml": info.html
				})).execute();

			}
		},
		addPermit: function(info) {
			var me = this;
			if (me.data && me.data.attributes && info.html) {
				me.data.attributes.permits = (me.data.attributes.permits || "") + info.html;

				(new AddDocumentQuery({
					"id": me.getId(),
					"type": me.getType(),
					"documentType": 'permits',
					"documentHtml": info.html
				})).execute();
			}
		},
		addAgreement: function(info) {
			var me = this;
			if (me.data && me.data.attributes && info.html) {
				me.data.attributes.agreements = (me.data.attributes.agreements || "") + info.html;

				(new AddDocumentQuery({
					"id": me.getId(),
					"type": me.getType(),
					"documentType": 'agreements',
					"documentHtml": info.html
				})).execute();
			}
		},
		addAdditionalDocument: function(info) {
			var me = this;
			if (me.data && me.data.attributes && info.html) {
				me.data.attributes.documents = (me.data.attributes.documents || "") + info.html;

				(new AddDocumentQuery({
					"id": me.getId(),
					"type": me.getType(),
					"documentType": 'documents',
					"documentHtml": info.html
				})).execute();
			}
		},

		addAttachment: function(info) {
			var me = this;
			if (me.data && me.data.attributes && info.html) {
				me.data.attributes.description = (me.data.attributes.description || "") + info.html;

				(new AddDocumentQuery({
					"id": me.getId(),
					"type": me.getType(),
					"documentType": 'description',
					"documentHtml": info.html
				})).execute();
			}
		},

		_getFiles: function(string) {
			var me = this;
			if (string) {

				var images = JSTextUtilities.ParseImages(string);
				var videos = JSTextUtilities.ParseVideos(string);
				var audios = JSTextUtilities.ParseAudios(string);
				var links = JSTextUtilities.ParseLinks(string);

				return images.concat(videos).concat(audios).concat(links);
			}

			return [];
		},

		removeAttachment: function(url) {
			var me = this;

			(['description', 'documents', 'agreements', 'permits', 'projectLetters', 'spatialFeatures']).forEach(function(type) {

				if (me.data && me.data.attributes && url && me.data.attributes[type].indexOf(url) >= 0) {

					var filtered = me._getFiles(me.data.attributes[type]).filter(function(fileInfo) {
						return fileInfo.url == url;
					});

					if (filtered.length && filtered[0].html) {
						(new RemoveDocumentQuery({
							"id": me.getId(),
							"type": me.getType(),
							"documentType": type,
							"documentHtml": filtered[0].html,
						})).execute();
					}
				}



			});



		},


		addSpatial: function(info) {
			var me = this;
			if (me.data && me.data.attributes && info.html) {
				me.data.attributes.spatialFeatures = (me.data.attributes.spatialFeatures || "") + info.html;

				(new AddDocumentQuery({
					"id": me.getId(),
					"type": me.getType(),
					"documentType": 'spatialFeatures',
					"documentHtml": info.html
				})).execute();
			}
		},

		isFlagged: function() {
			var me = this;
			return me.data.attributes.flagged === true || me.data.attributes.flagged === "true";
		},
		toggleFlag: function() {
			var me = this;

			(new FlagProposalQuery(me.getId(), !me.isFlagged())).execute();

			me.data.attributes.flagged = !me.isFlagged();
			if (me.isFlagged()) {
				me.fireEvent("flagged");
				return;
			}
			me.fireEvent("unflagged");

		},

		/**
		 * returns an object indexed by yyyy-mm-dd containing event name, or names ie: string or array<string>
		 */
		getEventDates: function(range) {

			var me = this;
			var events = {

			};

			me.getEvents(range).forEach(function(event) {


				var date = event.date


				if (!events[date]) {
					events[date] = [];
				}

				events[date].push(event);

			});



			var submit = me.getSubmitDate();
			var deadline = me.getDeadlineDate();
			var expiry = me.getExpiryDate();

			return events;
		},

		getEvents: function(range, dateFn) {

			var me = this;
			var events = [];

			me.getTasks().forEach(function(t) {

				var date = false;
				if (dateFn) {
					date = dateFn(t);
				} else {
					date = t.hasDueDate() ? t.getDueDate() : false;
				}

				if (date) {
					date = date.split(' ')[0];

					if (range) {
						// filter range items, but past items that are not complete

						var startDate = range[0].toISOString().split('T')[0];
						var endDate = range[1].toISOString().split('T')[0];


						if (!(date >= startDate && date < endDate)) {
							return;
						}

					}


					events.push({
						name: t.getName(),
						item: t,
						date: date
					});
				}

			})

			return events;
		},
		getClient: function() {
			var me = this;
			for (var i = 0; i < me._team.length; i++) {
				if (me._team[i].getId() == AppClient.getId()) {
					return me._team[i];
				}
			}

			return null;
		}


	});


	Project.ParseHtmlUrls = function(text) {

		if ((!text) || text == "") {
			return [];
		}

		return ([]).concat(JSTextUtilities.ParseVideos(text))
			.concat(JSTextUtilities.ParseImages(text))
			.concat(JSTextUtilities.ParseAudios(text))
			.concat(JSTextUtilities.ParseLinks(text))
			.map(function(o) {
				return o.url;
			});
	}


	Project.ListTeams = function() {
		return Community.teams;
	}

	Project.ListTerritories = function() {

		return Community.territories.map(function(name) {
			return String.capitalize.call(null, name)
		});
	}
	Project.ListOutcomes = function() {
		return ["Accepted", "Denied", "Declined", "Refuse", "Insufficient"];
	}


	Project.addTableHeader = function(listModule) {
		ProjectList.AddTableHeader(listModule);
	};

	Project.AddListEvents = function(listModule, target) {
		ProjectList.AddListEvents(listModule, target);
	}


	Project.AddListItemEvents = function(child, childView, application, listFilterFn) {
		ProjectList.AddListItemEvents(child, childView, application, listFilterFn);
	};

	Project.PendingButtons = function(item) {
		return ItemPending.PendingButtons(item);
	};


	Project.FormatProjectSelectionListModules = function(list, item, listItem) {
		return ItemUsersCollection.FormatProjectSelectionListModules(list, item, listItem);
	};


	Project.FormatUserSelectionListModules = function(list, item, listItem) {
		return ItemProjectsCollection.FormatUserSelectionListModules(list, item, listItem);
	};


	return Project;

})();


var Proposal = Project;