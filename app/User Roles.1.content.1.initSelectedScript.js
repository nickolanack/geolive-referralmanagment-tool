(new GetAttributeItemValueListQuery(
			GeoliveClient.getId(), 'user', {table:'userAttributes', fields:['isCommunityMember','isProponent','isLandsDepartment']}
		)).addEvent('onSuccess',function(data){


var values=data.values[0].entries[0];
if(values.isCommunityMember===true||values.isCommunityMember==="true"){
callback(0);
}else if(values.isProponent===true||values.isProponent==="true"){
callback(1);
}else if(values.isLandsDepartment===true||values.isLandsDepartment==="true"){
callback(2);
}

console.log(data);

}).execute();