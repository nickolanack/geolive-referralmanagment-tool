var btn=ConfigItem.CreateEditBtn(new ConfigItem({
    "editLabel":"Edit Notes introduction",
    'widget':options.widget,
    'form':'textFieldForm',
    'stepOptions':{
        width:600
    }
}));

if(btn){
    module.getElement().appendChild(btn);
}