
var d=item.getDaysUntilDeadline();

return new ModuleArray([
    new ElementModule("label",{html:"Deadline"}),
    new ElementModule("div",{html:item.hasDeadline()?(moment(item.getDeadlineDate()).format("MMM Do YYYY")+". "+d+" day"+(d==1?"":"s")+" left until deadline"):"There is no deadline set for this project", "class":"percent-complete-value"}),
    new ProgressBarModule({value:function(){ return item.getPercentTimeComplete(); },"class":"percent-complete reverse-tint"})
],{"class":"progress", identifier:"project-task-deadline"});