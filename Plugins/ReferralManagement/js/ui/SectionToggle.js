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
					            
					                console.log(me);
					                
					                me.getTargets().forEach(function(v, i){

					           

					  				    if(me._hidden){
					  				       v.show();
					  				       me.getElement().addClass('active');
					  				       return;
					  				   }
					  				   me.getElement().removeClass('active')
					  				   v.hide();
					  				});
					  				me._hidden=!me._hidden;
					            
					            
					            
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
				getFirst:function(){
					var targets= this.getTargets();
					if(targets.length==0){
						return null;
					}
					return targets.pop();
				},
				getTargets:function(){

					 if(this._filter instanceof Module){
					 	return [this._filter];
					 }

					 return this.getViewer().findChildViews(this._filter);
				}

			});


})();