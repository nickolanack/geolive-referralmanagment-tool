
var link=new ElementModule('label',{
    "class":"label-block",
        html:"Send me a magic login link"
    });
        
link.getElement().appendChild(new Element('button',{
    "class":"btn WizardButton",
    html:'Send Link'
}))
        
var setPwd=new ElementModule('label',{
        "class":"label-block",
        html:"Send me a magic login link"
    });    
        
setPwd.getElement().appendChild(new Element('button',{
        "class":"btn WizardButton",
        html:'Change Password'
    }))
        
return [link,setPwd]