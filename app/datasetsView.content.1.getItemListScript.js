
if(item instanceof ProjectList&&item.getLockFilter){
   var filter=item.getLockFilter();
   if(filter&&filter.length==1&&ProjectTagList.getProjectTagsData(filter[0]).length>0){
       return ProjectTagList.getProjectChildTagsData(filter[0]);
   }
}


return ProjectTagList.getProjectTagsData('_root');


/*
var MockEventDataTypeItem=new Class({
				Extends:MockDataTypeItem,
				Implements:[Events]

		});

return [
    
            
    
                new MockEventDataTypeItem({
					name:"Water",
					description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
				}),
				
				new MockEventDataTypeItem({
					name:"Community",
					description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
				}),
				
				new MockEventDataTypeItem({
					name:"Health",
					description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
				}),
				
				new MockEventDataTypeItem({
					name:"Forestry",
					description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
				}),
				
				new MockEventDataTypeItem({
					name:"Resources",
					description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
				}),
				
				new MockEventDataTypeItem({
					name:"Satellite",
					description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
				}),
    
    
    ]
    */