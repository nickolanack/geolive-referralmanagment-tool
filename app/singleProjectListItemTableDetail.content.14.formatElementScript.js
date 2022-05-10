el.addClass("inline security");
el.setAttribute("data-col","security");


var team=item.getUsers();
if(team.length){
    valueEl.appendChild(new Element('span', {'html':team.length, 'class':'team-member'}));
}