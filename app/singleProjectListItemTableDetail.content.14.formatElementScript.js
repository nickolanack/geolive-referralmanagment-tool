el.addClass("inline security");
el.setAttribute("data-col","security");


var team=item.getUsers();
if(team.length){
    valueEl.appendChild(new Element('span', {'html':team.length, 'class':'team-members'}));
}

var managers=valueEl.appendChild(new Element('span', {'html':'', 'class':'managers'}));
ProjectTeam.CurrentTeam(function(team){
    
   managers.html=team.getUsers().filter(function(u){
        
    }).length;
    
}).getUsers()