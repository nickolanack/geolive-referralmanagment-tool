var DockWizard=(function(){


	var DockWizard=new Class({


		dock:function(wizard){

			if(!document.body.hasClass('body-overlayed')){
				return
			}

			var el=wizard.viewer.getElement();
            var p=el.parentNode.parentNode;
            var o=p.previousSibling;
            var b=document.body;
            
            
            
            
           
            b.removeClass('body-overlayed');
            b.addClass('dock-overlayed');
            el.addClass('dock-left')
            p.addClass('dock-left')
            o.addClass('dock-left')
           
            SidePanelToggle.collapse();
           
            console.log('dock left');
                
            

		},

		undock:function(wizard){

			var el=wizard.viewer.getElement();
            var p=el.parentNode.parentNode;
            var o=p.previousSibling;
            var b=document.body;

            b.addClass('body-overlayed');
            b.removeClass('dock-overlayed');
            el.removeClass('dock-left');
            p.removeClass('dock-left');
            o.removeClass('dock-left');
            
            //SidePanelToggle.collapse();
            
            console.log('un dock left');

            
            
		},

		toggle:function(wizard){


			if(document.body.hasClass('body-overlayed')){
				this.dock(wizard);
				return;
			}

			this.undock(wizard);

		},

		createDockBtns:function(){

			var wizardEvent=null;

			return new Element('button', {
			    "class":"toggle-dock-form",
			    events:{
			        click:function(){
			            
			            var el=wizard.viewer.getElement();
			            var p=el.parentNode.parentNode;
			            var o=p.previousSibling;
			            var b=document.body;
			            
			            if(!wizardEvent){
			                
			                wizardEvent.on('complete', function(){
			                    
			                });
			                
			            }
			            
			            
			            
			            if(document.body.hasClass('body-overlayed')){
			                b.removeClass('body-overlayed');
			                b.addClass('dock-overlayed');
			                el.addClass('dock-left')
			                p.addClass('dock-left')
			                o.addClass('dock-left')
			               
			                SidePanelToggle.collapse();
			               
			                console.log('dock left');
			                
			                return;
			            }
			            b.addClass('body-overlayed');
			            b.removeClass('dock-overlayed');
			            el.removeClass('dock-left');
			            p.removeClass('dock-left');
			            o.removeClass('dock-left');
			            
			            //SidePanelToggle.collapse();
			            
			            console.log('un dock left');
			            
			            
			        }
			    }
			});
		}



	});





	return new DockWizard();

})();