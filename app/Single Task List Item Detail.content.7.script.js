return function(viewer, element, parentModule){
    
    
   
    element.addClass(item.isComplete()?"complete":"not-complete");
 
    
    var pop;
    var el=element.appendChild(new Element('div', {"class":"completion-indicator", 
    events:{click:function(e){
        e.stop();
        
   
       item.setComplete(!item.isComplete());
       item.save();
       
       if(item.isComplete()){
           element.removeClass('not-complete');
           element.addClass('complete');
           pop.setDescription('click to mark task incomplete');
       }else{
           element.addClass('not-complete');
           element.removeClass('complete');
           pop.setDescription('click to mark task complete');
       }
       
 
        
        
        
    }}}));
    
    
    pop=new UIPopover(el, {
        description:item.isComplete()?'click to mark task incomplete':'click to mark task complete'),
        anchor:UIPopover.AnchorAuto()
    });
}
    
    
}