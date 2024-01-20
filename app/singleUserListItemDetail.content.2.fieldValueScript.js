if(!item.getEmail){
    
    try{
        var user=ProjectTeam.CurrentTeam().getUser(item.getId());
        if(user){
            return user.getEmail();
        }
    }catch(e){
        
    }
    
    return '{missing getEmail()}';
}
return item.getEmail()