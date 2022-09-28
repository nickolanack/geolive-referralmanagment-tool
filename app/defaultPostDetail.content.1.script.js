if (ProjectTeam.CurrentTeam().hasUser(item.getUserId())) {
    return new ElementModule('span',{'class':"post-user", 'html':ProjectTeam.CurrentTeam().getUser(item.getUserId()).getName()});
}else{
   
   try{
       
       if(!!item.getMetadata().accessToken){
           if(item._discussion.options.channel=="proponent"){
               return new ElementModule('span',{'class':"post-user", 'htm':"Proponent"});
           }
       }

       
   }catch(e){}
   
   
}