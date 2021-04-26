var ProjectSelection=(function(){

	var ProjectSelectionClass=new Class({

		handleSelection:function(item, checkbox){

			if(checkbox.checked){

				checkbox.checked=false;
				return;
			}

			checkbox.checked=true;


		},
		initSelection:function(item, checkbox){



		}

	});
	var ProjectSelection=new ProjectSelectionClass();






	return ProjectSelection;

})()