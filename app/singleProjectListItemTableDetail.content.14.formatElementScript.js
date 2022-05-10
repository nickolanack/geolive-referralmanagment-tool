el.addClass("inline security");
el.setAttribute("data-col","security");


var team=item.getUsers();
if(team.length){
    valueEl.appendChild(new Element('span', {'html':team.length, 'class':'team-members'}));
}

console.log('security list');

var managers=valueEl.appendChild(new Element('span', {'html':'', 'class':'managers'}));
var team=ProjectTeam.CurrentTeam();
    
    managers.html=team.getUsers().filter(function(u){
        return u.isTeamManager()&&team.indexOf(u)==-1
    }).length;
    
