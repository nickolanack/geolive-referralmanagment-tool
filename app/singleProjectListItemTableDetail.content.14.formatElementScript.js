el.addClass("inline security");
el.setAttribute("data-col","security");


var users=item.getUsers();
if(users.length){
    valueEl.appendChild(new Element('span', {'html':users.length, 'class':'team-members'}));
}

console.log('security list');

var managers=valueEl.appendChild(new Element('span', {'html':'', 'class':'managers'}));
var team=ProjectTeam.CurrentTeam();
    
    managers.innerHTML=team.getUsers().filter(function(u){
        return u.isTeamManager()&&users.map(function(u){return u.getId()}).indexOf(u.getId())==-1;
    }).length;
    
