return function(viewer, element, parentModule){
    
    
    if(item.isComplete()){
        element.addClass("complete");
    }
    
    
   var el=element.appendChild(new Element('div', {"class":"completion-indicator", 
    events:{click:function(e){
        e.stop();
        
   
       item.setComplete(!item.isComplete());
       item.save();
       
       if(item.isComplete()){
         
           element.addClass('complete');
       }else{
           element.removeClass('complete');
          
       }
       
 
        
        
        
    }}}));
    
    
    
}