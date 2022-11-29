if (!(ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isSiteAdmin())) {
    module.getElement().setStyle('display', 'none');
}