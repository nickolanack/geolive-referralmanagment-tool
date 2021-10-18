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
        
        var input=valueEl.appendChild(new Element('input', {
    
            type:"text" ,events:{change:function(){
            console.log(this.value);
            item.setName(this.value);
            
        }}}));
        
        input.value=item.getName();
        
        valueEl.addEvent('click',function(e){
            e.stopPropagation();
            valueEl.addClass('editing');
            input.focus();
            input.addEvent('blur',function(){
                valueEl.removeClass('editing');
            })
        });

        
        
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