var login= new Element('label', {
    html:'Register to create an account', 'class':'login-button-text', 
    style:"text-align:left; color: mediumseagreen",
    events:{
        click:function(){
            //goto next step
            wizard.displayNext();
        }
}});
//login.appendChild(new Element('br'));
login.appendChild(new Element('button',{
    html:'Register',
    style:"background-color:mediumseagreen;",
    "class":"primary-btn"
    
}));
return login;