//archive/unarchive
if(item.getId()<=0){
    return null;
}


return new ElementModule('button',{"html":item.isArchived()?"Unarchive":"Archive", 
    "class":"primary-btn"+(item.isArchived()?" unarchive":" archive warn"), 
    "events":{"click":function(){
    
    
        var l=item.getTasks().filter(function(t){
            return !t.isComplete();
        }).length;
    
        if (item.isArchived()||confirm('Are you sure you want to archive this proposal?'+(l>0?("\nThere "+(l==1?"is":"are")+" "+l+" incomplete task"+(l==1?"":"s")+" left!"):""))) {


                                var controller=application.getNamedValue('navigationController');
    
                                if(item.isArchived()){
                                    item.unarchive(function(){
                                        controller.navigateTo("Archive","Configuration"); 
                                    });
                                    
                                }else{
                                    item.archive(function(){
                                        if(application.getNamedValue("currentProject")===item){
                                            controller.navigateTo("Dashboard","Main");   
                                        }
                                        
                                        
                                    });
                                   

                                }
                                
                            }
    
    
    
    
    

        }},
        identifier:"button-archive"
})


