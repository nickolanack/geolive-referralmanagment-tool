
var link=new ElementModule('label',{
    "class":"label-block",
        html:"Send me a magic login link"
    });
        
link.getElement().appendChild(new Element('button',{
    "class":"btn WizardButton",
    "style":"background-color:mediumseagrean;",
    html:'Send Link',
    events:{click:function(){
        (new AjaxControlQuery(CoreAjaxUrlRoot, 'send_magic_link', {
		  'plugin': "Users",
		  'data':wizard.getData()
		})).execute(); 
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
            (new AjaxControlQuery(CoreAjaxUrlRoot, 'send_password_reset', {
    		  'plugin': "Users",
    		  'data':wizard.getData()
    		})).execute(); 
        }}
    }))
        
return [link,setPwd]