return new MockEventDataTypeItem({
    'content':"",
    setContent:function(c){
        localStorage.setItem("myTheme", c);
    }
});