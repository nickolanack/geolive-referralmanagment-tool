


IncludeJSBlock('



    var DashboardConfig=new Class({
        getValue:function(n,c){
            
            
        }
    });


');

GetWidget('sharedDashboardTheme')->display($targetInstance);
GetWidget('sharedGeneratedStyles')->display($targetInstance);

GetWidget('createDashboardForm')->display($targetInstance);

GetWidget('adminStyles')->display($targetInstance);   
GetWidget('darkTheme')->display($targetInstance);   


IncludeCSSBlock('


    .ui-view.dashboard-main.dark:before {
        background-image: url("https://gather.geoforms.ca/assets/images/tim-johnson-bmljdpdeigw-unsplash.jpg");
        content:
        "";
        width: 100%;
        height: 100%;
        position: fixed;
        background-size: cover;
        opacity: 0.2;
        z-index: 0;
    }
    
    .ui-view.dashboard-main.dark {
        z-index: 1;
    }



');