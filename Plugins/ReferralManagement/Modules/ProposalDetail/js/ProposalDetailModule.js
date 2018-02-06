var ProposalDetailModule = new Class({
	Extends: Module,
	initialize: function(proposal, options) {
		var me = this;
		me.parent(options);

		me.proposal = proposal;
	},
	process: function() {

		var me = this;



		me._getAttributes(function(err, attributes) {

			if (!err) {

				var container = new Element('div', {
					'class': 'ProposalDetailModule'
				});
				me.node.appendChild(container);

				Array.each(JSTextUtilities.ParseLinks(attributes.spatialFeatures), function(link) {
					container.appendChild(new Asset.image(CoreContentUrlRoot + "&format=raw&controller=plugins&plugin=Maps&view=plugin&pluginView=kml.tile&kml=" + encodeURIComponent(link.url)));
				});


			}

			me.fireEvent('load');
		})



	},
	_getAttributes: function(callback) {

		var me = this;

		if (me.options.attributes) {
			callback(null, me.options.attributes);
		} else {
			(new GetAttributeItemValueListQuery(me.proposal.getId(), me.proposal.getType(), {
				table: 'proposalAttributes',
				fields: ['title', 'description', 'documents', 'spatialFeatures']
			})).addEvent('onSuccess', function(data) {

				callback(null, data.values[0].entries[0])



				me.fireEvent('load');
			}).addEvent('onFailure', function() {
				callback('Query Failed');
			}).execute();
		}

	}

});