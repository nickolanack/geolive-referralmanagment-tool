var ConfigItem=(function(){

	var ConfigItem=new Class({});




	ConfigItem.GetTextBlock=function(){


		var user=ProjectTeam.CurrentTeam().getUser(AppClient.getId());


var div=new Element('div', {
    html:`<div class="section-title">
    <span class="thin">Welcome Back,</span> `+user.getName()+`</div>`,
    'class':"section-help section-welcome section-module"
        
}); 


var content=new Element('span',{});
div.appendChild(content)
var text="";
DashboardConfig.getValue("welcomeText", function(value){
    content.innerHTML=value;
    text=value;
})

if(!(AppClient.getUserType()=="admin"||ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isTeamManager())){
    return div;
}

div.appendChild(new Element('button',{
    
    html:"edit",
    'class':'inline-edit',
    events:{click:function(){
        
        
        var config=(new MockDataTypeItem({
            mutable:true,
            label:'Edit welcome text',
            text:text
        }));
    
        config.addEvent('save', function(){
        
            content.innerHTML=config.getText();
            text=config.getText();
        
            (new AjaxControlQuery(CoreAjaxUrlRoot, 'set_configuration_field', {
    	        "widget": "dashboardContentConfig",
    	        "field":{
    	            "name":"welcomeText",
    	            "value":config.getText()
                }
            })).execute();
        
        
        });
        
        
        
        
        (new UIModalDialog(
            application, 
            config, 
            {"formName":"textFieldForm", "formOptions":{template:"form"} }
        )).show();
		   
    }}
    
}));


		   
		                		
return div;		  


	}



	return ConfigItem;

})()