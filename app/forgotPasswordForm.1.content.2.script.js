
var link=new ElementModule('label',{
    "class":"label-block",
        html:"Send me a magic login link"
    });
        
link.getElement().appendChild(new Element('button',{
    "class":"btn WizardButton",
    "style":"background-color:mediumseagrean;",
    html:'Send Link'
}))
        
var setPwd=new ElementModule('label',{
        "class":"label-block",
        html:"Send me a link to change my password"
    });    
        
setPwd.getElement().appendChild(new Element('button',{
        "class":"btn WizardButton",
        html:'Change'
    }))
        
return [link,setPwd]