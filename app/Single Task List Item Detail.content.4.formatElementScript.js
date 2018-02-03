el.addClass('float-right due-date')
if(item.isOverdue()){
    el.addClass('overdue');
    el.parentNode.addClass('overdue');
}

var replacementMap=function(str){

    return str.replace('days', 'd').replace('day', 'd').replace('hours', 'h').replace('hour', 'h');
    
}

valueEl.setAttribute('data-due-date', item.hasDueDate()?replacementMap(moment(item.getDueDate()).fromNow()):"No Date");

