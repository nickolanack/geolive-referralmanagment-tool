  ProjectTeam.AddListItemEvents(child, childView, function(u){ return item.hasUser(u); });
  //Project.AddUserListItemEvents(child, childView, function(u){ return item.hasUser(u); });
  UIInteraction.addUserProfileClick(childView.getElement(), child);