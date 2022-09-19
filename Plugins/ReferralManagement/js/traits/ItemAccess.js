var ItemAccess = (function() {


	var ItemAccess = new Class_({


	});


	ItemAccess.GetSharingInfo = function(item) {

		var sharedLabel = '';
		var sharedIndex = -1;
		var sharedImage = null;
		var className = '';

		ProjectList.SharedListFilters().forEach(function(filter, i) {
			if (filter.filterFn(item)) {
				className=filter.name.split(' ').join('-');
				sharedImage = filter.icon;
				sharedLabel = filter.tip || filter.label;
				sharedIndex = i;
			}
		})

		if (sharedIndex == 3 && item.getProjectSubmitterId() + "" == AppClient.getId() + "") {
			sharedLabel = "You created this in another community. Managers of <b>" + item.getProjectCommunity() + "</b> can edit.";
		}


		sharedLabel = sharedLabel.replace('{itemCommunity}', item.getProjectCommunity());

		return {
			className:className,
			label: sharedLabel,
			icon: sharedIcon
		};

	};

	ItemAccess.AddInlineAccessIndicator = function(item, el, valueEl) {

		// el.addClass("inline sharing");
		// el.setAttribute("data-col","sharing");

		if (item instanceof TagCloudModule) {
			var tagClount = item;
			item = {
				isPublic: function() {
					return false;
				},
				getProjectCommunity: function() {
					return 'gct3';
				},
				getCommunitiesInvolved: function() {
					return [];
				},
			}
		}

		var sharedInfo = ItemAccess.GetSharingInfo(item);

		el.addClass(sharedInfo.className);
		valueEl.setAttribute('data-sharedLabel', sharedInfo.label);
		valueEl.setStyle('background-image', 'url(' + sharedInfo.icon + ')');

		


		new UIPopover(valueEl, {
			description: sharedInfo.label,
			anchor: UIPopover.AnchorAuto()
		});


	};


	return ItemAccess;

})();