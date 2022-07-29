
return new ModuleArray([
    new ElementModule("label",{html:"Tasks completed"}),
    new ElementModule("div",{html:item.getPercentComplete()+"%", "class":"percent-complete-value"}),
    new ProgressBarModule({value:function(){ return item.getPercentComplete(); },"class":"percent-complete"})
],{"class":"progress", identifier:"project-task-progress"});