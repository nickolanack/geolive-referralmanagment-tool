<?php 
    //$base=GetPlugin('Maps')->urlForView('mapitem.staticmap');
    //return new ElementModule("img",{ src:"--php echo $base;--&mapitem="+item.id,"class":"static-map"});
?>


return new ElementModule("img",{ src:item.style,"class":"static-map"});