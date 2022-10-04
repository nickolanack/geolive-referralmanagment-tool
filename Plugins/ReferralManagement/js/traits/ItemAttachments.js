var ItemAttachments = (function() {


	var AddDocumentQuery = ProjectQueries.AddDocumentQuery;
	var RemoveDocumentQuery = ProjectQueries.RemoveDocumentQuery;


	var ItemAttachments = new Class({

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

			var list=[];

			if (me.data && me.data.attributes.spatialFeatures) {
				list=Project.ParseHtmlUrls(me.data.attributes.spatialFeatures);
			}

			if(me.data&&me.data.metadata&&me.data.metadata.file){
				list.push("{datawarehouse}/{project:"+me.getId()+"}/defualt.kml");
			}



			return list;

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
				return (new HTMLTagParser()).parseMedia(string);
			}

			return [];
		},

		removeAttachment: function(url) {
			var me = this;

			(['description', 'documents', 'agreements', 'permits', 'projectLetters', 'spatialFeatures']).forEach(function(type) {

				if (me.data && me.data.attributes && me.data.attributes[type] && url && me.data.attributes[type].indexOf(url) >= 0) {

					var filtered = me._getFiles(me.data.attributes[type]).filter(function(fileInfo) {
						return fileInfo.url == url;
					});

					if (filtered.length && filtered[0].html) {

						var fileInfo=filtered.shift();

						(new RemoveDocumentQuery({
							"id": me.getId(),
							"type": me.getType(),
							"documentType": type,
							"documentHtml": fileInfo.original||fileInfo.html,
						})).execute();
					}
				}



			});



		},

		getDocuments: function() {
			var me = this;
			return me.getProjectLetterDocuments().concat(me.getPermitDocuments()).concat(me.getAdditionalDocuments()).concat(me.getAgreementDocuments());
		}


	});



	ItemAttachments.ParseHtmlUrls = function(text) {

		if ((!text) || text == "") {
			return [];
		}

		return (new HTMLTagParser()).mediaUrls(text);
	}

	return ItemAttachments;


})()