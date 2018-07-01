
var link=new ElementModule('label',{
        html:"Send me a magic login link"
    });
        
link.getElement().appendChild(new Element('button',{
    html:'Send Link'
}))
        
var setPwd=new ElementModule('label',{
        html:"Send me a magic login link"
    });    
        
setPwd.getElement().appendChild(new Element('button',{
        html:'Change Password'
    }))
        
return [link,setPwd]