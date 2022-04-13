

var type=(item.getType?item.getType():item.type).split('.').pop();
var map={"proposal":"project"};
if(map[type]){
    type=map[type];
}

return 'single'+(type.capitalize())+'ListItemDetail';


return namedView;