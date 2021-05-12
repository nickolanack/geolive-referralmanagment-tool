return new MockDataTypeItem({
    'content':"",
    setContent:function(c){
        localStorage.setItem("myTheme", c);
    }
});