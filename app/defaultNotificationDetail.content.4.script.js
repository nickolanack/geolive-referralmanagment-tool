if (ProjectTeam.CurrentTeam().hasUser(item.getUserId())) {
    return new ElementModule('span',{'class':"post-user", 'html':'by '+ProjectTeam.CurrentTeam().getUser(item.getUserId()).getName()});
}