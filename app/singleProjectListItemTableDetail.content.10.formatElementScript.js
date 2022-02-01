el.addClass("inline tag-width");
el.setAttribute("data-col","community");


var communities=([item.getProjectCommunity()]).concat(item.getCommunitiesInvolved())
//return communities.slice(0,2).join(', ')+(communities.length>2?', '+communities.length+' other'+(communities.length==3?'':'s'):'')

var types=communities;

 valueEl.innerHTML=types[0];

types.slice(1).forEach(function(type){
  var tag=el.appendChild(new Element('span', {"class":"field-value"}));
  tag.innerHTML=type;
    RecentItems.colorizeEl(tag, type);
    tag.addEvent('click', function(e){
        e.stop();//Propagation()
        UIInteraction.navigateToNamedCategoryType(type);
    });
});