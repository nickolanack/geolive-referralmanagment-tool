GetWidget('sharedDashboardTheme')->display($targetInstance);
GetWidget('sharedGeneratedStyles')->display($targetInstance);

GetWidget('createDashboardForm')->display($targetInstance);

GetWidget('adminStyles')->display($targetInstance);   
GetWidget('darkTheme')->display($targetInstance);   



IncludeJSBlock('



    var DashboardConfig=new Class({
        getValue:function(n,c){
            
            
        }
    });


');