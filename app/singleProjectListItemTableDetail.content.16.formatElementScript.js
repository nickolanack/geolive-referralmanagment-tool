el.addClass("inline sharing");
el.setAttribute("data-col","sharing");



ProjectList.SharedListFilters().forEach(function(filter){
    if(filter.filterFn(item)){
        el.addClass(filter.name);
        valueEl.setStyle('background-image', 'url('+filter.icon+')');
    }
})