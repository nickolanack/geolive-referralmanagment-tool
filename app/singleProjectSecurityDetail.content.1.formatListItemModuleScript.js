if(child instanceof DashboardUser){
   childView.getElement().addClass('user-item');
   UIInteraction.addUserProfileClick(childView.getElement(), child);
}

return item;