var ProjectSelection = (function() {


	var selection = [];


	var ProjectSelectionClass = new Class({
		Implements:[Events],
		handleSelection: function(item, checkbox) {

			console.log('selection');

			if (checkbox.checked) {

				NotificationBubble.Make("", "Added `" + project.getName() + "` to selection");
				if (selection.indexOf(project.getId()) == -1) {
					selection.push(project.getId());
					this.fireEvent('select',[project.getId()])
					this.fireEvent('change',[selection.slice(0)]);
				}

				return;
			}

			NotificationBubble.Make("", "Removed `" + project.getName() + "` to selection");
			var index = selection.indexOf(project.getId());
			if (index >= 0) {
				selection.splice(index, 1);
				this.fireEvent('unselect',[project.getId()]);
				this.fireEvent('change',[selection.slice(0)]);
			}

		},
		initSelection: function(item, checkbox) {



		}

	});
	var ProjectSelection = new ProjectSelectionClass();



	return ProjectSelection;

})()