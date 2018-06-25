
ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    
    if(item.getMetadata().items){
      callback(item.getMetadata().items.map(function(i){
           
           var type=i.type;
           
           if(type=='ReferralManagement.team'){
               return team;
           }
           if(type=='Tasks.task'){
               return team.getTask(i.id);
           }
           if(type=='ReferralManagement.proposal'){
               return team.getProposal(i.id);
           }
           if(type=='User'){
               try{
                   return team.getUserOrDevice(i.id);
               }catch(e){
                    console.error(e);
                    return new MockDataTypeItem({
                        type:"user",
                        name:"user no longer exists",
                        email:''
                    })
                   
               }
           }
           
           
           return i;
       }))
    }

callback([]);
    
    
    
    
    
})
