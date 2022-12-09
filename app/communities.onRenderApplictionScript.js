

IncludeJSBlock('



    var DashboardConfig=new Class({
        getValue:function(n,c){
            
            
        }
    });


');


IncludeCSSBlock('

    a.ui-view[data-view="communityItem"] {
        display: inline-block;
        width: 100%;
        min-height: 250px;
        margin: 30px;
        margin-top: 100px;
        box-sizing: border-box;
        backdrop-filter: blur(10px);
        background-color: rgba(0,0,0,0.3);
        position: relative;
        padding: 30px;
        border-radius: 9px;
        filter: drop-shadow(0 0 5px #00000080);
        cursor:pointer;
        transition:filter 0.8s, opacity 0.8s;
         opacity:0.8;
    }
    a.ui-view[data-view="communityItem"]:hover {
        filter: drop-shadow(0 0 10px #000000A0);
         opacity:1;
         transition:filter 0.2s, opacity 0.8s;
    }
    
    span.array-module.ui-list-view {
        margin: auto;
        max-width: 1000px;
        position: relative;
        width: calc( 100% - 300px );
    }
    
    span.field-value {
        text-transform: capitalize;
        position: absolute;
        top: -50px;
        font-size: 40px;
       
        filter: drop-shadow(0 0 6px black);
    }


');

GetWidget('sharedDashboardTheme')->display($targetInstance);
GetWidget('sharedGeneratedStyles')->display($targetInstance);

GetWidget('createDashboardForm')->display($targetInstance);

GetWidget('adminStyles')->display($targetInstance);   
GetWidget('darkTheme')->display($targetInstance);   
GetWidget('installStyle')->display($targetInstance);

GetWidget('dialogForm')->display($targetInstance);
