var btn=ConfigItem.CreateEditBtn(new ConfigItem({
    "editLabel":"Edit user introduction",
    'widget':options.widget,
    'form':'textFieldForm',
    'stepOptions':{
        width:600
    }
}));

if(btn){
    module.getElement().appendChild(btn);
}

module.getElement().addEvent('click', function(){
   module.getElement().addClass('activated');
});