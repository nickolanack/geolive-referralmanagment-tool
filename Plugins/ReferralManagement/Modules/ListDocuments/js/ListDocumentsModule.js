var ListDocumentsModule = new Class({
	Extends: Module,
	initialize: function(proposal, options) {
		var me = this;
		me.parent(options);

		me.proposal = proposal;
	},
	process: function() {

		var me = this;



		var ul=new Element('ul', {'class':'proposal-documents'});
		me.proposal.getSpatialDocuments().forEach(function(url){
			var li=ul.appendChild(new Element('li',{"class":"spatial-doc"}));
			var a=li.appendChild(new Element('a', {"href":url, "target":"_blank"}));

			new UIPopover(li, {
			    description:"Download spatial doc",
			    anchor:UIPopover.AnchorTo(
			    ['bottom', 'top'])
			});
		});

		me.proposal.getProjectLetterDocuments().forEach(function(url){
			var li=ul.appendChild(new Element('li',{"class":"project-letter-doc"}));
			var a=li.appendChild(new Element('a', {"href":url, "target":"_blank"}));

			new UIPopover(li, {
			    description:"Download project letter",
			    anchor:UIPopover.AnchorTo(
			    ['bottom', 'top'])
			});

		});

		me.proposal.getPermitDocuments().forEach(function(url){
			var li=ul.appendChild(new Element('li',{"class":"permit-doc"}));
			var a=li.appendChild(new Element('a', {"href":url, "target":"_blank"}));

			new UIPopover(li, {
			    description:"Download permit",
			    anchor:UIPopover.AnchorTo(
			    ['bottom', 'top'])
			});
		});

		me.node.appendChild(ul);



		me.fireEvent('load');


		



	}

});