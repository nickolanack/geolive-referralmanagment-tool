
var t=item.getTasks().filter(function(t){
    return !t.isComplete();
});
var u=t.filter(function(t){
    return !t.isOverdue();
}).length;

var o=t.length-u;
var uStr=u + " upcoming";
var oStr='<span class="overdue">'+o + " overdue</span>";

var str=(u>0?uStr:"")+(u>0&&o>0?" and ":"")+(o>0?oStr:"")
if(u==0&&o==0){
    str="0 remaining tasks";
}

return new ModuleArray([
    new ElementModule("label",{html:"Remaining Tasks"}),
    new ElementModule("div",{html:str, "class":"percent-complete-value"}),
    new ProgressBarModule({value:function(){ return 100-item.getPercentComplete(); },"class":"percent-complete"})
],{"class":"progress"});