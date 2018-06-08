
list.content.push(new ElementModule('button',{
    "class":"remove-btn",
    events:{click:function(){
        if(confirm("Are you sure")){
            alert("do");
            return;
        }
        alert("don't");
    }}
}))

return list