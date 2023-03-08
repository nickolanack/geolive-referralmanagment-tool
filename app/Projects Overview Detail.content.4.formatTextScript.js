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
     
    if(team.getProjects().length>0){
        module.getElement().addClass('hidden');
    }
     
 });