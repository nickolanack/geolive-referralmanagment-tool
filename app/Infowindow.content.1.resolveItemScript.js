try{
return ProjectTeam.CurrentTeam().getUserOrDevice(item.getNamedValue('data').uid)
}catch(e){
    return ProjectTeam.CurrentTeam().getUser(AppClient.getId());
}