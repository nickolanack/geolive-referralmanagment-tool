var ProjectSelection = (function() {


	var selection = [];


	var ProjectSelectionClass = new Class({
		Implements:[Events],
		handleSelection: function(item, checkbox) {

			console.log('selection');

			if (checkbox.checked) {

				this.addProject(item);

				return;
			}

			this.removeProject(item);

		},

		addProject:function(item){

			
			if (selection.indexOf(item.getId()) == -1) {
				NotificationBubble.Make("", "Added `" + item.getName() + "` to selection");
				selection.push(item.getId());
				this.fireEvent('select',[item.getId()])
				this.fireEvent('change',[selection.slice(0)]);
			}


		},
		removeProject:function(item){


			var index = selection.indexOf(item.getId());
			if (index >= 0) {
				NotificationBubble.Make("", "Removed `" + item.getName() + "` to selection");
				selection.splice(index, 1);
				this.fireEvent('unselect',[item.getId()]);
				this.fireEvent('change',[selection.slice(0)]);
			}


		},
		clear:function(){
			var sel=selection;
			selection=[];
			this.fireEvent('unselect',[sel]);
			this.fireEvent('change',[selection.slice(0)]);
		},
		initSelection: function(item, checkbox) {



		},
		hasSelection:function(){
			return selection.length>0;
		},
		hasProject:function(item){
			return selection.indexOf(item.getId())>=0;
		},
		getProjects:function(){

			return selection.map(function(pid){
				try{
					return ProjectTeam.CurrentTeam().getProject(pid);
				}catch(e){

				}

				return null
			}).filter(function(p){
				return !!p;
			});
		}

	});
	var ProjectSelection = new ProjectSelectionClass();


	ProjectSelection.MakeSelectionIndicator=function(){

		var application =ReferralManagementDashboard.getApplication();

		var module= new ElementModule('span',{
		    "class":"notifications selection",
		    events:{click:function(){
		        if(ProjectSelection.hasSelection()){
		        	var controller = application.getNamedValue('navigationController');
		        	controller.navigateTo("Map", "Main");
		        }
		        
		    }}
		});


		module.getElement().appendChild(new Element('button', {
			"html":"clear", 
			"class":"primary-btn", 
			"events":{"click":function(e){

				e.stop();

				ProjectSelection.clear();
			}}
		}));

		if(!(DashboardConfig.getValue('enableProposals')||ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isCommunityMember())){

			module.getElement().appendChild(new Element('button', {
				"html":"New "+ProjectList.NameForProject(), 
				"class":"primary-btn create", 
				"events":{"click":function(e){

					e.stop();

					var formName = DashboardConfig.getValue("leftPanelSecondaryBtnForm"); //"documentProjectForm";//"ProposalTemplate";
					var newItem = new Proposal();

					selection.forEach(function(item){
						newItem.addProject(item);
					});

					application.getDisplayController().displayPopoverForm(formName, newItem, application, {
						template: "form"
					});

					newItem.addEvent("save:once", function() {
						ProjectTeam.CurrentTeam().addProject(newItem);
						UIInteraction.navigateToProjectOverview(newItem);
					});
				}}
			}));
		}

		module.getElement().appendChild(new Element('button', {
			"html":"View Selection", "class":"primary-btn view-selection "+(!DashboardConfig.getValue('enableProposals')?'with-collections':'with-props'), 
			"events":{
				"click":function(e){
					e.stop();
					var controller = application.getNamedValue('navigationController');
					controller.navigateTo("Map", "Main");
				}
			}
		}));

		var popoverContent=function(){

			if(selection.length==0){
				return 'no items in selection';
			}

			return selection.length+' item'+(selection.length==1?'':'s')+' selected';


		};
		var popover=new UIPopover(module.getElement(), {
			description:popoverContent()
		});

		ProjectSelection.addEvent('change', function(selection){


			popover.setText(popoverContent());
		
			module.getElement().setAttribute('data-count', selection.length);
			if(selection.length>0){
				module.getElement().addClass('has-selection');
				return;
			}
			module.getElement().removeClass('has-selection');

		});


		return module;
		
		
		
	}


	ProjectSelection.MakePreviewBtn=function(){

		var btn= new Element('button', {html:"View selection", "class":"primary-btn nav-new-btn view-selection inline"});


		if(ProjectSelection.hasSelection()){
			btn.addClass('with-selection');
		}

		//add weak event

		new WeakEvent(btn, ProjectSelection, 'change', function(selection){
		    
		    if(selection.length>0){
		        btn.addClass('with-selection');
		        return;
		    }
		    btn.removeClass('with-selection');

		    
		})


		btn.addEvent('click', function(){
		    
		    
		    var application =ReferralManagementDashboard.getApplication();
					
						var controller = application.getNamedValue('navigationController');
						controller.navigateTo("Map", "Main");
		    
		    
		})

		var el=new ElementModule('div',{"class":"selection-btn-container"});
		el.appendChild(btn);
		return el;


	};



	return ProjectSelection;

})()