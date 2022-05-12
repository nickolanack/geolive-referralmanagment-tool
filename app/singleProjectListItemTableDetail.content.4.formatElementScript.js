el.addClass("inline");
el.setAttribute("data-col","user");

var userid=item.getProjectSubmitterId();

if(ProjectTeam.CurrentTeam().hasUser(userid)){
    UIInteraction.addUserProfileClick(el, ProjectTeam.CurrentTeam().getUser(userid));
}

if(item.hasGuestSubmitter()){
    var guest=el.appendChild(new Element('span',{"class":"guest-submitter"}))
    new UIPopover(guest, {
        description:"submitted by: "+item.getProjectSubmitter(),
        anchor:UIPopover.AnchorAuto()
    });
}