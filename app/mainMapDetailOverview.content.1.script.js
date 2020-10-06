



window.GetSpatialFiles=function(){
    
    
    return [];
    
}


return null;

var iframe=new ElementModule('iframe',{
    "src":"https://wabun.geolive.ca/wabun-map/embed",
    "height":"100%",
    "width":"100%",
    "frameborder":"0",
    "styles":{"min-height":"400px"},
    "allowfullscreen":true
});
//return '<iframe src="https://wabun.geolive.ca/wabun-map/embed" width="100%" height="100%" frameborder="0" style="min-height:700px;"></iframe>';

var setSize=function(){
    var size=window.getSize();
    iframe.getElement().setStyle('height',size.y+"px");
    
};
window.addEvent('resize', setSize);
setSize();

return iframe;





