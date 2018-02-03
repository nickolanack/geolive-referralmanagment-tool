


var data=[

    
    
    ]
    var i=0;
    
    var today=new Date();
    var todayStr = (today).toISOString().split('T')[0];
    
    
    for(i=-6;i<=7;i++){
        data.push((function(){
            var day=(new Date(today.valueOf()+(i*24*3600*1000)));
            
            
            var range=[day, (new Date(today.valueOf()+((1+i)*24*3600*1000)))];
            
            var events=item.getEvents(range);
            
            
            var segments=[];
            
         
            var completeEvents=ReferralManagementDashboard.taskHighlightMouseEvents(function(){
                return complete.userItems.map(function(e){return e.item});
                
            });
            var incompleteEvents=ReferralManagementDashboard.taskHighlightMouseEvents(function(){
                return incomplete.userItems.map(function(e){return e.item});
                
            });
            
            var complete={value:0, userItems:[], "class":"complete", "events":completeEvents};
            var incomplete={value:0, userItems:[], "events":incompleteEvents}
            
            
            if(day.valueOf()<today.valueOf()){
               incomplete["class"]="overdue"; 
            }
            
            events.forEach(function(e){
                if(e.item.isComplete()){
                    complete.value++;
                    complete.userItems.push(e);
                }else{
                    incomplete.value++;
                    incomplete.userItems.push(e);
                    
                }
            })
            
            if(complete.value){
                segments.push(complete);
            }
             if(incomplete.value){
                segments.push(incomplete);
            }
            
            var d={
              label:day.getDate(),
              value:events.length,
              segments:segments
              
              
            }
            
            
            
            // var d={
            //   label:day.getDate(),
            //   value:events.length,
            //   segments:events.map(function(e, i){
                  
            //       var segmentData={
            //         value:1,
            //         userData:e
            //       }
                  
                  
            //       if(e.item.isComplete()){
            //           segmentData.class="complete"
            //       }
                  
            //       return segmentData;
            //   })
            // }
            
            if(todayStr==day.toISOString().split('T')[0]){
                        d.class="active";
                    }
            
            
            
            return d;
            
        })())
    }
    
    data[0]["class"]="trans";
   // data[data.length-1]["class"]="active";

var actions=0;
data.forEach(function(d){
    actions+=d.segments.length;
});

return new ModuleArray([
    new ElementModule("label",{html:"Project Activity"}),
    new ElementModule("div",{
        html:actions+' action'+(actions==1?' has':'s have')+' been recorded recently.'
    }),
    
    
    
    
    new BarChartModule({data:data })

    
    
    
   
],{"class":"inline-list-item timesheets-list-item-icon"});