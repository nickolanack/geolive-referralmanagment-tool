var SidePanelToggle=(function(){


	var SidePanelToggle=new Class_({


		initialize:function(){

			var popover;
			var el = new Element('div',{"class":"panel-toggle", events:{click:function(){
			    var me=this;
			    var node=function(n){
			        if(!n){
			            n=me;
			        }
			        if(n.parentNode.hasClass('ui-view')){
			            return n.parentNode;
			        }
			        return node(n.parentNode);
			    }
			    
			    var target=node();
			    if(target.hasClass("closed")){
			        target.removeClass("closed");
			        me.removeClass("closed");
			        popover.setDescription("hide side panel");
			    }else{
			        target.addClass("closed");
			        me.addClass("closed");
			        popover.setDescription("show side panel");
			    }
			    
			    
			    
			}}});

			popover=new UIPopover(el, {
			    description:"hide side panel",
			    anchor:UIPopover.AnchorAuto(),
			    offset:{x:20, y:20}
			});

			this.element=el;
			
		},
		getElement:function(){
			return this.element;
		}




	});


	



	return new SidePanelToggle();


})();
