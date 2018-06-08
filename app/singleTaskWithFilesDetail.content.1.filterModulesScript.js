
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
list.content.push((new ModalFormButtonModule(application, task,{
        label:"Edit",
        formName:"fileForm",
        formOptions:{
            template:"form"
        },
        hideText:true,
        "class":"inline-btn add primary-btn"
    })).addEvent("show",function(){
        
    }))

return list