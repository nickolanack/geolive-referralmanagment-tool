var ItemStatus = (function() {


	var ItemStatus = new Class({



	});


	ItemStatus.AddTags = function(item, el, valueEl) {



		el.addClass("inline tag-width");
		el.setAttribute("data-col", "community");


		var communities = ([item.getProjectCommunity()]).concat(item.getCommunitiesInvolved())
		//return communities.slice(0,2).join(', ')+(communities.length>2?', '+communities.length+' other'+(communities.length==3?'':'s'):'')

		var showRootCommunity = false;
		if (!showRootCommunity) {
			var i = communities.indexOf(UserGroups.GetCollective());
			if (i >= 0) {
				communities.splice(i, 1);
			}

		}

		if (communities.length == 0) {
			return;
		}

		var types = communities;
		var plainTag = new NamedCategory({
			name: "",
			shortName: "",
			description: "",
			type: "Community.tag",
			id: -1,
			color: "#f0f0f0",
			category: "_"
		});



		valueEl.innerHTML = types[0];
		RecentItems.colorizeEl(valueEl, types[0], plainTag);
		el.addEvent('click', function(e) {
			e.stop(); //Propagation()
			UIInteraction.navigateToNamedCommunityType(types[0]);
		});


		var others = types.slice(1);
		if (others.length > 0) {
			var othersEl = el.appendChild(new Element('span', {
				"class": "field-value not-tag",
				"html": '' + others.length + ' other' + (others.length == 1 ? '' : 's')

			}));

			var content = new Element('div');
			//var textContent='';

			types.slice(1).forEach(function(type, i) {


				var tag = content.appendChild(new Element('span', {
					"class": "field-value tip-tag"
				}));

				//tag.innerHTML=type;
				RecentItems.colorizeEl(tag, type, plainTag);
				tag.addEvent('click', function(e) {
					e.stop(); //Propagation()
					UIInteraction.navigateToNamedCommunityType(type);
				});

				tag.innerHTML = type;


			});

			new UIPopover(othersEl, {
				content: content,
				anchor: UIPopover.AnchorAuto(),
				clickable: true
			});

		}



	};


	return ItemStatus;


})();