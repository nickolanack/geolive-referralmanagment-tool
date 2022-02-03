el.addClass("inline ids");
el.setAttribute("data-col","id");


if(item.getPermitIds){
    var permits=item.getPermitIds();
    if(permits.length){
        el.addClass('has-ids');
        el.addClass('has-'+(permits.length)+'id'+(permits.length==1?'':'s'))
    }
    
    var ids=el.appendChild(new Element('span',{"class":"id-items"}));
    
    new UIPopover(ids, {
        description:permits.join("<br/>"),
        anchor:UIPopover.AnchorAuto()
    });
}