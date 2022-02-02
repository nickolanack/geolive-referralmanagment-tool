el.addClass("inline check");
el.setAttribute("data-col","id");


if(item.getPermitIds){
    var permits=item.getPermitIds();
    if(permits.length){
        el.addClass('has-ids');
        el.addClass('has-'+(permits.length)+'id'+(permits.length==1?'':'s'))
    }
    
}