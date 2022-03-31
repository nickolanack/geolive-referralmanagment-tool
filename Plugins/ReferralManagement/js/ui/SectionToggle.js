var SectionToggle=(function(){


	return new Class_({
				Extends:ElementModule,
				initialize:function(filter, options){

					var me=this;
					this._filter=filter;
					this._toggleOptions=options||{};

					this._hidden=false;


					ElementModule.prototype.initialize.call(this, 'button', {
					    'class':'section-toggle',
					    events:{
					        click:function(){
					           
				            	me.toggle();
					        }
					    }
					});
 
					this.runOnceOnLoad(function(){
					    
						if(me.getTargets().length==0){
							me.remove();
							return;
						}


					    var item=me.getFirst();

					    if(!(item&&item.runOnceOnLoad)){
					    	console.error(me._filter);
					    	throw 'Expected item to be a module';
					    }

					  	 item.runOnceOnLoad(function(){



					  	 	if(typeof me._toggleOptions.startHidden=='boolean'){

					  	 		me.getTargets().forEach(function(target){


					  	 			if(me._toggleOptions.startHidden==true){
					  	 				target.getElement().addClass('hidden');
					  	 				return;
					  	 			}
					  	 			target.getElement().removeClass('hidden');


					  	 		});
					  	 	}

					  	     if(item.getElement().hasClass('hidden')){
					  	         me._hidden=true;
					  	         me.getElement().removeClass('active')
					  	         return;
					  	     }
					  	     me.getElement().addClass('active')


					  	     me.fireEvent('init');

					  	 });
					  	 
					});

				},
				toggle:function(){
					if(this._hidden){
						this.expand();
						return;
					}
					this.collapse();
				},
				expand:function(){
					var me=this;
					if(!me._hidden){
						return;
					}
					me.getTargets().forEach(function(v, i){
	  				    v.show();
	  				    me.getElement().addClass('active');	  				  
	  				});
				  	me._hidden=false;            
					me.fireEvent('expand');
					            
				},
				collapse:function(){
					var me=this;
					if(me._hidden){
						return;
					}
					me.getTargets().forEach(function(v, i){
	  				   	me.getElement().removeClass('active')
	  				   	v.hide();
	  				});
				 	me._hidden=true;
					me.fireEvent('collapse');
					            
				},
				getFirst:function(){
					var targets= this.getTargets();
					if(targets.length==0){
						return null;
					}
					return targets.pop();
				},

				findTargets:function(filter){
					if(filter instanceof Module){
					 	return [filter];
					}

					return this.getViewer().findChildViews(filter);
				},

				getTargets:function(){
					 return this.findTargets(this._filter);
				}

			});


})();