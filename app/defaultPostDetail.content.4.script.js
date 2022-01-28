if (ProjectTeam.CurrentTeam().hasUser(item.getUserId())) {
    return ProjectTeam.CurrentTeam().getUser(item.getUserId()).getName()
}