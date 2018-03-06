return function(viewer, element, parentModule){
    
    
   
    element.addClass(item.isComplete()?"complete":"not-complete");
 
    
    
    var el=element.appendChild(new Element('div', {"class":"completion-indicator", 
    events:{click:function(e){
        e.stop();
        
   
       item.setComplete(!item.isComplete());
       item.save();
       
       if(item.isComplete()){
           element.removeClass('not-complete');
           element.addClass('complete');
       }else{
           element.addClass('not-complete');
           element.removeClass('complete');
          
       }
       
 
        
        
        
    }}}));
    
    
    
}