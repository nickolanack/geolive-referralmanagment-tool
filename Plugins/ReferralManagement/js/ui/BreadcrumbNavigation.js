var BreadcrumbNavigation=(function(){


	var BreadcrumbNavigation=new Class_({
		Implements:[Events],

		_setRoot:function(label, view){

			if(this._clickRoot){
				this._labelEl.removeEvent('click', this._clickRoot)
			}

			this._clickRoot=function(){
		         controller.navigateTo.apply(controller, view);
		    };

			this._labelEl.addEvent('click', this._clickRoot);
		    this._labelEl.addClass('clickable')
		    this._labelEl.innerHTML="Dashboard";

		},

		getApplication:function(){
			return this._application;
		},

		
		hidePath:function(){
			this._valueEl.addClass('hidden');
		},
		showPath:function(){
			this._valueEl.removeClass('hidden');
		},


		addPath:function(path, handler){

			if(!this._handlers){
				this._handlers={};
				
			}
			this._handlers[path]=handler;
			return this;
		},


		setPath:function(view){

			if(this._handlers[view]){
	        	var result=this._handlers[view](this._rootState, this._rootItem);
	        	if(typeof result=='string'){
	        		view=result;
	        	}
	        }
			this._valueEl.innerHTML=view;


		},


		render:function(el, labelEl, valueEl){

			var me=this;


			me.addPath('Project', function(){

				var p=me.getApplication().getNamedValue("currentProject");
				if(p){

					var projectsName=DashboardConfig.getValue('enableProposals')?ProjectList.NameForProjects():"Collections";

					var type = p.isDataset()?'Dataset':projectsName.substring(0,projectsName.length-1);

					return type + ': '+p.getName();
				}

			});


			me.addPath('Projects', function(state, item){

				if(item&&item.getLabel){


					if(item.getLockFilter){
						try{
							var filter=item.getLockFilter();
							if(filter&&filter[0]){
								var tag=ProjectTagList.getTag(filter[0]);

								var parent;
								var list=[];
								while(parent=tag.getParentTagData()){
									list.unshift(parent.getShortName());
								}

								if(list.length){
									return list.join(', ')+', '+item.getLabel();
								}


							}
						}catch(e){
							console.error(e);
						}
					}


					return item.getLabel();
				}

				if(item&&item.label){
					return item.label;
				}

				return ((DashboardConfig.getValue('showDatasets')?"Datasets & ":"")+(DashboardConfig.getValue('enableProposals')?ProjectList.NameForProjects():"Collections"));

			});





			GatherDashboard.getApplication(function(application){



				application.getNamedValue('navigationController',function(controller){

					me._application=application;
					me._controller=controller;
					me._labelEl=labelEl;
					me._valueEl=valueEl;
					me._el=el;
		    
				    me._setRoot('Dashboard', ['Dashboard', 'Main']);
				    
				
				    controller.addEvent('navigate', function(state, options, item) {
				        

				        me._rootState=state;
				        me._rootItem=item;

				        if(state.view=='Dashboard'){
				           me.hidePath();
				            return;
				        }
				       
				        me.setPath(state.view);
				        me.showPath();
				        
				    

				    });
				    
				    controller.addEvent('childNavigation', function(menu, state, options, item) {

				        me.setPath(me._rootState.view);
				        me.showPath();
				        valueEl.appendChild(new Element('span', {"class":"field-value", html:state.view}));
				        
				    });
				    
				});

			});



		}


	});


			

	return new BreadcrumbNavigation();


})()