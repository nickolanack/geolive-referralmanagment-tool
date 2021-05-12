var item= (new MockDataTypeItem({
    mutable:true,
    'content':"",
    
}))

item.addEvent('save',function(){
    
        localStorage.setItem("myTheme", c.getContent());
});

return item;