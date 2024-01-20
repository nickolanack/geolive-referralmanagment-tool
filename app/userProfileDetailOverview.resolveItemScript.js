
if(item instanceof GenericApp){
    return ProjectTeam.CurrentTeam().getUser(AppClient.getId());
}
return item