var item= (new MockDataTypeItem({
    mutable:true,
    'content':"",
    
}))

item.addEvent('save',function(){
    
        localStorage.setItem("myTheme", item.getContent());
        DashboardLoader.updateTheme();
});

return item;