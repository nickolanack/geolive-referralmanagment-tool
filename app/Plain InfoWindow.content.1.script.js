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

var schemaData=item.getNamedValue('SchemaData');
if(schemaData){
    return schemaData.split("\n\t\t").filter(function(line){
        return line.trim().length>0;
    }).join("<br/>");
}

return null;