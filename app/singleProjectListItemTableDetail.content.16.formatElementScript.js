el.addClass("inline sharing");
el.setAttribute("data-col","sharing");

var sharedLabel='';

ProjectList.SharedListFilters().forEach(function(filter){
    if(filter.filterFn(item)){
        el.addClass(filter.name);
        valueEl.setStyle('background-image', 'url('+filter.icon+')');
        sharedLabel=filter.tip||filter.label;
    }
})

 new UIPopover(valueEl, {
        description:sharedLabel,
        anchor:UIPopover.AnchorAuto()
    });