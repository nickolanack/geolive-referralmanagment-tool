var btn=ConfigItem.CreateEditBtn(new ConfigItem({
    "editLabel":"Edit Empty Projects",
    'widget':options.widget,
    'form':'textFieldForm',
    'stepOptions':{
        width:600
    }
}));

if(btn){
    module.getElement().appendChild(btn);
}


 ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
     
    if(team.getProjects().filter(function(p){
        return p.getTasks().length>0;
    }).length>0){
        module.getElement().addClass('hidden');
    }
     
 });