

var hidden=false;
var toggle= new ElementModule('button', {
    'class':'section-toggle'
    events:{
        click:function(){
                
                toggle.getViewer().findChildViews(function(v) {
    					return v instanceof UIListViewModule
  				}).forEach(function(v){
  				   if(hidden){
  				       v.show();
  				       return;
  				   }
  				   v.hide;
  				});
  				hidden=!hidden;
            
            
            
        }
    }
});

return toggle;