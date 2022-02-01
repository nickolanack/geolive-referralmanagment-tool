
var communities=([item.getProjectCommunity()]).concat(item.getCommunitiesInvolved())
return communities.slice(0,2).join(', ')+(communities.length>2?', '+communities.length+' other'+(communities.length==3?'':'s'):'')