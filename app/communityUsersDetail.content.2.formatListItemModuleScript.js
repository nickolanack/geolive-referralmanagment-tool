
  ProjectTeam.AddListItemEvents(child, childView, function(c){return c.isCommunityMember()||c.isUnassigned();});
  UIInteraction.addUserProfileClick(childView.getElement(), child);

