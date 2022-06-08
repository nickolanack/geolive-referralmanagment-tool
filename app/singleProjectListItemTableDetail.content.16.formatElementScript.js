el.addClass("inline sharing");
el.setAttribute("data-col","sharing");

var sharedLabel='';
var sharedIndex=-1;

ProjectList.SharedListFilters().forEach(function(filter, i){
    if(filter.filterFn(item)){
        el.addClass(filter.name);
        valueEl.setStyle('background-image', 'url('+filter.icon+')');
        sharedLabel=filter.tip||filter.label;
        sharedIndex=i;
    }
})

    if(sharedIndex==2&&item.getProjectSubmitterId()+""==AppClient.getId()+""){
        sharedLabel="You created this in another community. Managers of <b>"+item.getProjectCommunity()+"</b> can edit.";
    }


 new UIPopover(valueEl, {
        description:sharedLabel,
        anchor:UIPopover.AnchorAuto()
    });