var ItemCollection=(function(){


var ItemCollection=new Class({});



	ItemCollection.AddSelectionButtonBehavior=function(has, add, remove){

		var setLabelAndStyle = function(btn) {


			if (has()) {
				btn.innerHTML = "Remove"
				btn.addClass("error");

			} else {
				btn.innerHTML = "Add";
				btn.removeClass("error");

			}



		}
		var button = new ElementModule('button', {
			"class": "primary-btn injected-btn",
			html: "Add",
			events: {
				click: function() {


					if (has()) {
						remove();
					} else {
						add();
					}
					setLabelAndStyle(button.getElement());


				}
			}
		});

		setLabelAndStyle(button.getElement());


		return button;




	}

	


	


	return ItemCollection;


})();