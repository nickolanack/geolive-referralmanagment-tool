return new ElementModule('button', {"class":"primary-btn", events:{click:function(){
    wizard.close();
}}});