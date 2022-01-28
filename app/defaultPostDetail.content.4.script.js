if (ProjectTeam.CurrentTeam().hasUser(item.getUserId())) {
    return new Element('span',{'class':"post-user", 'html':ProjectTeam.CurrentTeam().getUser(item.getUserId()).getName()});
}