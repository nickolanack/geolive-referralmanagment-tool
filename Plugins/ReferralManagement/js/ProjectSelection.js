var ProjectSelection = (function() {


	var selection = [];


	var ProjectSelectionClass = new Class({
		Implements:[Events],
		handleSelection: function(item, checkbox) {

			console.log('selection');

			if (checkbox.checked) {

				NotificationBubble.Make("", "Added `" + item.getName() + "` to selection");
				if (selection.indexOf(item.getId()) == -1) {
					selection.push(item.getId());
					this.fireEvent('select',[item.getId()])
					this.fireEvent('change',[selection.slice(0)]);
				}

				return;
			}

			NotificationBubble.Make("", "Removed `" + item.getName() + "` to selection");
			var index = selection.indexOf(item.getId());
			if (index >= 0) {
				selection.splice(index, 1);
				this.fireEvent('unselect',[item.getId()]);
				this.fireEvent('change',[selection.slice(0)]);
			}

		},
		initSelection: function(item, checkbox) {



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


	ProjectSelection.MakePreviewBtn=function(){

		var btn= new Element('button', {html:"View selection", "class":"primary-btn nav-new-btn view-selection inline"});

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


		return btn;


	};



	return ProjectSelection;

})()