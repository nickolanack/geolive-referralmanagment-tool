var login= new Element('label', {
    html:'View Public Map', 'class':'login-button-text', 
    style:"text-align:left; color: mediumseagreen",
    events:{
        click:function(){
            //goto next step
           
        }
}});
//login.appendChild(new Element('br'));
login.appendChild(new Element('button',{
    html:'View Map',
    style:"",
    "class":"primary-btn"
    
}));
return login;