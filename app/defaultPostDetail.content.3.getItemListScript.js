

if(item.getMetadata().items){
   return item.getMetadata().items.map(function(i){
       
       var type=i.type;
       
       if(type=='ReferralManagement.team'){
           return ProjectTeam.CurrentTeam();
       }
       if(type=='Tasks.task'){
           return ProjectTeam.CurrentTeam().getTask(i.id);
       }
       if(type=='ReferralManagement.proposal'){
           return ProjectTeam.CurrentTeam().getProposal(i.id);
       }
       if(type=='User'){
           return ProjectTeam.CurrentTeam().getUser(i.id);
       }
       
       
       return i;
   })
}

return [];