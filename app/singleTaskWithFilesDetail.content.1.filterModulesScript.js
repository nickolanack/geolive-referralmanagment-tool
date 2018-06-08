
list.content.push(new Element('button',{
    events:{click:function(){
        if(confirm("Are you sure")){
            alert("do");
            return;
        }
        alert("don't");
    }}
}))

return list