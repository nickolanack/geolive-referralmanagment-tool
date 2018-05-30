
var userCollection=application.getNamedValue("currentProject");

console.log("Item is: "+(item===userCollection?"same":"diff"))

var setLabelAndStyle=function(btn){
    
    if(userCollection.hasUser(item)){
         btn.innerHTML= "Remove"
         btn.addClass("error");
        
    }else{
         btn.innerHTML="Add"; 
         btn.removeClass("error");
        
    }
    
   
}
var button = new ElementModule('button', {"class":"primary-btn", html:"Add", events:{click:function(){
    
  if(userCollection.hasUser(item)){
      userCollection.removeUser(item);
  }else{
      userCollection.addUser(item);
  }
    
  
    setLabelAndStyle(button.getElement());
    
}}});

setLabelAndStyle(button.getElement());


return button;