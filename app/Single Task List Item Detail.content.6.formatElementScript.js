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


if(item.getId()<=0){
    return;
}

var input=valueEl.appendChild(new Element('input', {
    
    type:"date" ,events:{change:function(){
    console.log(this.value);
    item.setDueDateDay(this.value);
    
}}}));

input.value=item.getDueDate().split(' ').shift();

valueEl.addEvent('click',function(e){
    e.stopPropagation();
    valueEl.addClass('editing');
    input.focus();
    input.addEvent('blur',function(){
        valueEl.removeClass('editing');
    })
});


