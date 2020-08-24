return null;
return new ModuleArray([
    new ElementModule("label",{html:"Budget"}),
    new ElementModule("div",{html:item.getPercentBudgetComplete()+"%", "class":"percent-complete-value"}),
    new ProgressBarModule({value:function(){ return item.getPercentBudgetComplete(); },"class":"percent-complete"})
],{"class":"progress"});