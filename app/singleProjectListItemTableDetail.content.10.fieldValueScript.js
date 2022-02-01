
var communities=([item.getProjectCommunity()]).concat(item.getCommunitiesInvolved())
return communities.slice(0,2).join(', ')+(communites.length>2?' and '+communites.length+' other'+(communites.length==3?'':'s'):'')