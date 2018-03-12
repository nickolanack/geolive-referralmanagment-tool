el.addClass('float-right due-date')
if(item.isOverdue()){
    el.addClass('overdue');
    el.parentNode.addClass('overdue');
}

var replacementMap=function(str){

    return str.replace('days', 'd').replace('day', 'd').replace('hours', 'h').replace('hour', 'h');
    
}
valueEl.addClass('duedate');
valueEl.setAttribute('data-due-date', item.hasDueDate()?replacementMap(moment(item.getDueDate()).fromNow()):"No Date");
var input=valueEl.appendChild(new Element('input', {
    value:item.getDueDate(),
    type:"date" ,events:{change:function(){
    console.log(this.value);
}}}));

valueEl.addEvent('click',function(e){
    //e.stop();
    valueEl.addClass('editing');
    input.focus();
    input.addEvent('blur',function(){
        valueEl.removeClass('editing');
    })
});


