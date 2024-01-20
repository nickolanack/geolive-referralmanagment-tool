var btn=ConfigItem.CreateEditBtn(new ConfigItem({
    "editLabel":"Edit form text",
    'widget':options.widget,
    'form':'textFieldForm',
    'stepOptions':{
        width:600
    }
}));

if(btn){
    module.getElement().appendChild(btn);
}