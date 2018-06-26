return new ElementModule('button',{
    "html":"Chat",
    "class":"public-user-chat",
    events:{click:function(){
        
        var chat=$$(".users-public-chat");
        if(chat.hasClass('enabled')){
            chat.removeClass('enabled');
            return;
        }
        chat.addClass('enabled');
    }}
})