var SidePanelToggle=(function(){


	var SidePanelToggle=new Class_({
		Implements:[Events],

		initialize:function(){

			this._expanded=true;
			var me=this;
			var popover;
			var el = new Element('div',{"class":"panel-toggle", events:{click:function(){
			    
			    var node=function(n){
			        if(!n){
			            n=el;
			        }
			        if(n.parentNode.hasClass('ui-view')){
			            return n.parentNode;
			        }
			        return node(n.parentNode);
			    }
			    
			    var target=node();
			    if(target.hasClass("closed")){
			        target.removeClass("closed");
			        el.removeClass("closed");
			        popover.setDescription("hide side panel");
			        me._expanded=true;
			        me.fireEvent('expand');
			        return;
			    }

			  
		        target.addClass("closed");
		        el.addClass("closed");
		        popover.setDescription("show side panel");
			    me._expanded=false;
			    me.fireEvent('collapse');



			    
			    
			    
			}}});

			popover=new UIPopover(el, {
			    description:"hide side panel",
			    anchor:UIPopover.AnchorAuto()
			});

			this.element=el;
			
		},
		getElement:function(){
			return this.element;
		},
		isExpanded:function(){
			return this._expanded;
		},

		createPopover:function(el, text){

			var popover=new UIPopover(el, {
				description:text,
				anchor:UIPopover.AnchorAuto()
			});

			this.on('collapse',function(){
				popover.enable();
			});

			this.on('expand',function(){
				popover.disable();
			});

			if(this.isExpanded()){
				popover.disable();
			}

		}




	});


	



	return new SidePanelToggle();


})();
