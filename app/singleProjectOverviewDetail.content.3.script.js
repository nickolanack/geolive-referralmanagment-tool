

var d=item.getDaysUntilDeadline();

return new ModuleArray([
    new ElementModule("label",{html:"Deadline"}),
    new ElementModule("div",{html:item.hasDeadline()?(d+" day"+(d==1?"":"s")+" left until deadline, "+moment(item.getDeadlineDate()).format("MMM Do")):"There is no deadline set for this project", "class":"percent-complete-value"}),
    new ProgressBarModule({value:function(){ return item.getPercentTimeComplete(); },"class":"percent-complete reverse-tint"})
],{"class":"progress"});