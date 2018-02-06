var SpatialPreviewModule = new Class({
	Extends: Module,
	initialize: function(proposal, options) {
		var me = this;
		me.parent(options);

		me.proposal = proposal;
	},
	process: function() {

		var me = this;



		var ul=new Element('ul', {'class':''});
		var li=new Element('li', {'class':'WizardButton disabled spatial-preview', style:'margin: 10px 0;'});
		var txt=new Element('span', {'class':'btn-label', html:'preview'});

		ul.appendChild(li);
		li.appendChild(txt);


		new UIPopover(li, {
		    description:"View spatial overlays on map",
		    anchor:UIPopover.AnchorTo(
		    ['bottom', 'top'])
		});


		var previous=me.options.previous;
		var wizard=me.options.wizard;

		var hasFiles=function(){


			if(previous&&previous.TextFieldModule){
				var value=previous.TextFieldModule.getValue();

				return value&&(JSTextUtilities.ParseLinks(value).length>0);

			}

			return me.proposal.getSpatialDocuments().length>0;

		};

		var getFiles=function(){

			if(previous){

				return JSTextUtilities.ParseLinks(previous.TextFieldModule.getValue()).map(function(o){
					return o.url;
				});
			}

			return me.proposal.getSpatialDocuments();
		};

		var updateButton=function(){
			if(hasFiles()){
				li.removeClass('disabled');




			}else{
				li.addClass('disabled');
			}
		};

		li.addEvent('click',function(){
			if(!li.hasClass('disabled')){

				
					var clear=SpatialDocumentPreview.show(getFiles(), wizard, function(){

					if(wizard){

						if (wizard) {
							wizard.addEvent('complete', function() {

								clear();

							}).addEvent('cancel', function() {

								clear();

							});
						}

						wizard.viewer.pushbox.win.setStyle('display', null);
						wizard.viewer.pushbox.overlay.setStyle('display', null);
					}
				});

				if(wizard){

					wizard.viewer.pushbox.win.setStyle('display', 'none');
					wizard.viewer.pushbox.overlay.setStyle('display', 'none');

				}

				
			}
		});
		if(previous){
			previous.TextFieldModule.addEvent('change', updateButton);
		}
		
		setTimeout(function(){
			updateButton();
		},500)


		me.node.appendChild(ul);



		me.fireEvent('load');


		



	}

});