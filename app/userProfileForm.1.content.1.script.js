

var userId = parseInt((item.getUserId || item.getId).bind(item)());
						

var name="your";
if (AppClient.getId() !== userId) {
    name="users";
}
return new ElementModule('h2',{html:"Edit "+name+" profile"});