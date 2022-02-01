el.addClass("inline tag-width");
el.setAttribute("data-col","community");


var communities=([item.getProjectCommunity()]).concat(item.getCommunitiesInvolved())
//return communities.slice(0,2).join(', ')+(communities.length>2?', '+communities.length+' other'+(communities.length==3?'':'s'):'')

var showRootCommunity=false;
if(!showRootCommunity){
    var i=communities.indexOf(UserGroups.GetCollective());
    if(i>=0){
        communities.splice(i,1);
    }
    
}

if(communities.length==0){
    return;
}

var types=communities;
var plainTag=new NamedCategory({
			name: "",
			shortName: "",
			description: "",
			type: "Community.tag",
			id: -1,
			color: "#f0f0f0",
			category: "_"
		});



 valueEl.innerHTML=types[0];
 RecentItems.colorizeEl(valueEl, types[0], plainTag);
 el.addEvent('click', function(e){
    e.stop();//Propagation()
    UIInteraction.navigateToNamedCommunityType(types[0]);
});

types.slice(1).forEach(function(type,i){
  var tag=el.appendChild(new Element('span', {"class":"field-value tag-alt"}));
    
    //tag.innerHTML=type;
    RecentItems.colorizeEl(tag, type, plainTag);
    tag.addEvent('click', function(e){
        e.stop();//Propagation()
        UIInteraction.navigateToNamedCommunityType(type);
    });
});