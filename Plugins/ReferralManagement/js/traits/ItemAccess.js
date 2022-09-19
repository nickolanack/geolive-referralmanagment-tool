var ItemAccess=(function(){


	var ItemAccess=new Class_({});


	ItemAccess.AddInlineAccessIndicator = function(item, el, valueEl) {

		el.addClass("inline sharing");
		el.setAttribute("data-col","sharing");

		var sharedLabel='';
		var sharedIndex=-1;

		ProjectList.SharedListFilters().forEach(function(filter, i){
		    if(filter.filterFn(item)){
		        el.addClass(filter.name.split(' ').join('-'));
		        valueEl.setStyle('background-image', 'url('+filter.icon+')');
		        sharedLabel=filter.tip||filter.label;
		        sharedIndex=i;
		    }
		})

		    if(sharedIndex==3&&item.getProjectSubmitterId()+""==AppClient.getId()+""){
		        sharedLabel="You created this in another community. Managers of <b>"+item.getProjectCommunity()+"</b> can edit.";
		    }
		    
		    
		    sharedLabel=sharedLabel.replace('{itemCommunity}', item.getProjectCommunity());


		 new UIPopover(valueEl, {
		        description:sharedLabel,
		        anchor:UIPopover.AnchorAuto()
		    });


	};


	return ItemAccess;

})();