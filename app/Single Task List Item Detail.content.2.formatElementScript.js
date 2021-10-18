 el.addClass('task-title');
 if(item.isComplete()){
       el.addClass('complete');
      
   }
   
   
   if(item.getDescription()&&item.getDescription()!==""){
     el.addClass('with-description');
   }
   
   
   ReferralManagementDashboard.addItemDiscussionInfo(el, item, application);
  
    
    var edit=el.appendChild(new Element('span'));
    
    if(item.getId()<=0){
        return;
    }
    
    edit.addClass('editable');
    edit.addEvent("click",function(){
        
        
        var formName="taskForm";


            
            application.getDisplayController().displayPopoverForm(
				formName, 
				item, 
				{template:"form"}
			);
        
    })
    
    valueEl.addClass('clickable-task');
    valueEl.addEvent('click',function(){
        
        
        application.getDisplayController().displayPopoverForm(
				"taskDetailPopover", 
				item, 
				application,
				{}
			);
    })