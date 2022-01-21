

var hidden=false;
var toggle= new ElementModule('button', {
    'class':'section-toggle',
    events:{
        click:function(){
            
                console.log(toggle);
                
                toggle.getViewer().findChildViews(function(v) {
    					return v instanceof UIListViewModule
  				}).forEach(function(v){
  				   if(hidden){
  				       v.show();
  				       return;
  				   }
  				   v.hide();
  				});
  				hidden=!hidden;
            
            
            
        }
    }
}).runOnceOnLoad(function(){
    var list= toggle.getViewer().findChildViews(function(v) {
    	return v instanceof UIListViewModule
  	 }).pop();
  	 
  	 list.runOnceOnLoad(function(){
  	     if(list.getElement().hasClass('hidden')){
  	         hidden=true;
  	     }
  	 });
  	 
})

return toggle;