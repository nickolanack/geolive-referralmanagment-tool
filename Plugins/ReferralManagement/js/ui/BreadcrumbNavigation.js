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
	        	var result=this._handlers[view]();
	        	if(typeof result=='string'){
	        		view=result;
	        	}
	        }
			this._valueEl.innerHTML=view;


		},


		render:function(el, labelEl, valueEl){

			var me=this;


			me.addPath('Project', function(){

				var p=application.getNamedValue("currentProject");
				if(p){
					return 'Project: '+p.getName();
				}

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