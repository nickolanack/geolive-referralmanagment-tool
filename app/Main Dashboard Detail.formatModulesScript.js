
//return function(callback){

    if(DashboardConfig.getValue('showRecentProjectsDetail')){
        list.content=list.content.slice(5);
        
    }else{
        list.content=list.content.slice(0,5);
    }
    
    //callback(list);
    
//}