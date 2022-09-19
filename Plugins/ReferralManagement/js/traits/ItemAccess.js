var ItemAccess = (function() {


	var ItemAccess = new Class_({
		getProjectCommunity:function(){
			return this.data.community;
		},

		getCommunitiesInvolved: function() {

			var me = this;

			if (me.data && me.data.attributes.firstNationsInvolved) {
				var communities= me.data.attributes.firstNationsInvolved;

				if(typeof communities=='string'){

					if(communities.length>0&&communities[0]=='['){
						communities=JSON.parse(communities);
					}

				}

				return communities;
			}

			return [];
		}

	});


	ItemAccess.GetSharingInfo = function(item) {

		var sharedLabel = '';
		var sharedIndex = -1;
		var sharedIcon = null;
		var className = '';

		ProjectList.SharedListFilters().forEach(function(filter, i) {
			if (filter.filterFn(item)) {
				className=filter.name.split(' ').join('-');
				sharedIcon = filter.icon;
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
		// 
	
		var lastClass=null;
		var popover=null;


		var updateEls=updateEls=function(){

			var sharedInfo = ItemAccess.GetSharingInfo(item);

			if(lastClass){
				el.addClass(lastClass);
			}

			el.addClass(sharedInfo.className);
			lastClass=sharedInfo.className;

			valueEl.setAttribute('data-sharedLabel', sharedInfo.label);
			valueEl.setStyle('background-image', 'url(' + sharedInfo.icon + ')');

			if(!popover){
				popover=new UIPopover(valueEl, {
					description: sharedInfo.label,
					anchor: UIPopover.AnchorAuto()
				});
			}else{
				popover.setDescription(sharedInfo.label);
			}

		};

		if (item instanceof TagCloudModule) {
			var tagCloud = item;

			var getCommunitiesModule=function(){
				var viewer=tagCloud.getViewer();
				if(!viewer){
					return null;
				}
				var modules=tagCloud.getViewer().findChildViews(function(t){return t instanceof TagCloudModule});
				if(modules.length==2){
					return modules.pop()
				}
				return null;
			}

			

			item = {
				isPublic: function() {
					if(tagCloud.getValues().indexOf('Public')>=0){
						return true;
					}
					return false;
				},
				getProjectCommunity: function() {
					return 'gct3';
				},
				getCommunitiesInvolved: function() {

					var mod=getCommunitiesModule();
					if(mod){
						return mod.getValues();
					}

					return [];
				},
			}

			tagCloud.on('change', updateEls);
			tagCloud.runOnceOnLoad(function(){
				var mod=getCommunitiesModule();
				if(mod){
					mod.on('change', updateEls);
				}

				updateEls();
			});
		}

		

		updateEls();



	};


	return ItemAccess;

})();