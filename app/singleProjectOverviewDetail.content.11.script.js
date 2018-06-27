return null;

var files=item.getStarredDocuments();
var count=files.length;
return new ModuleArray([
    new ElementModule("label",{html:"Files"}),
    new ElementModule("div",{
        html:count+' file'+(count==1?' has':'s have')+' been favorited.'
    })
    
    
   
],{"class":"inline-list-item files-list-item-icon favourited-files"});