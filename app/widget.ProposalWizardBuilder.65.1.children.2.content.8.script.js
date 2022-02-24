console.log('hello world');



return new ElementModule('button',{
    html:'+',
    events:{click:function(){
        console.log(step.getModules(function(wizardModule){
            return true;
        })());
    }}
})