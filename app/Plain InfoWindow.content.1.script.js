console.error(item);
var data=item.getNamedValue('data');
if(data){
    if(typeof data=='string'){
        data=JSON.parse(data);
    }
    
    var t = new Element('table');
    Object.keys(data).forEach(function(k){
       var tr = t.appendChild(new Element('tr'));
       tr.appendChild(new Element('td', {html:k}));
       tr.appendChild(new Element('td', {html:data[k]}));
    });
    return t;
    
}


return null;