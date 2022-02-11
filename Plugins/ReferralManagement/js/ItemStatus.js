var ItemStatus = (function() {


	var ItemStatus = new Class({


		getProjectStatus:function(){

			return [
				'Filing', 'Monitoring'
			]
		}
	});


	ItemStatus.AddTags = function(item, el, valueEl) {




		var types = item.getProjectStatus();
		
		var plainTag = new NamedCategory({
			name: "",
			shortName: "",
			description: "",
			type: "Status.tag",
			id: -1,
			color: "#f0f0f0",
			category: "_"
		});



		valueEl.innerHTML = types[0];
		RecentItems.colorizeEl(valueEl, types[0], plainTag);
		el.addEvent('click', function(e) {
			e.stop(); //Propagation()
			UIInteraction.navigateToNamedStatusType(types[0]);
		});


		var others = types.slice(1);
		if (others.length > 0) {
			var othersEl = el.appendChild(new Element('span', {
				"class": "field-value not-tag",
				"html": '' + others.length + ' other' + (others.length == 1 ? '' : 's')

			}));

			//var content = new Element('div');
			//var textContent='';

			types.slice(1).forEach(function(type, i) {


				var tag = el.appendChild(new Element('span', {
					"class": "field-value alt-tag"
				}));

				//tag.innerHTML=type;
				RecentItems.colorizeEl(tag, type, plainTag);
				tag.addEvent('click', function(e) {
					e.stop(); //Propagation()
					UIInteraction.navigateToNamedStatusType(type);
				});

				tag.innerHTML = type;


			});

			// new UIPopover(othersEl, {
			// 	content: content,
			// 	anchor: UIPopover.AnchorAuto(),
			// 	clickable: true
			// });

		}



	};


	return ItemStatus;


})();