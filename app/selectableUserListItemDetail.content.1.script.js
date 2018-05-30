
var project=application.getNamedValue("currentProject");

console.log("Item is: "+(item===project?"same":"diff"))

var setLabelAndStyle=function(btn){
    
    if(project.hasUser(item)){
         btn.innerHTML= "Remove"
         btn.addClass("error");
        
    }else{
         btn.innerHTML="Add"; 
         btn.removeClass("error");
        
    }
    
   
}
var button = new ElementModule('button', {"class":"primary-btn", html:"Add", events:{click:function(){
    
  if(project.hasUser(item)){
      project.removeUser(item);
  }else{
      project.addUser(item);
  }
    
  
    setLabelAndStyle(button.getElement());
    
}}});

setLabelAndStyle(button.getElement());


return button;