
var link=new ElementModule('label',{
    "class":"label-block",
        html:"Send me a magic login link"
    });
        
link.getElement().appendChild(new Element('button',{
    "class":"btn WizardButton",
    "style":"background-color:mediumseagrean;",
    html:'Send Link',
    events:{click:function(){
        item.setSendMagicLink();
        wizard.complete()
    }}
}))
        
var setPwd=new ElementModule('label',{
        "class":"label-block",
        html:"Send me a link to reset my password"
    });    
        
setPwd.getElement().appendChild(new Element('button',{
        "class":"btn WizardButton",
        html:'Reset',
        events:{click:function(){
            item.setSendReset();
            wizard.complete();
        }}
    }))
        
return [link,setPwd]