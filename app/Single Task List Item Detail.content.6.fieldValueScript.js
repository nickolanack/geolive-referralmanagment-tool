
var dateString="No Due Date";


if(item.hasDueDate()){
    dateString=item.getDueDate();
    if(dateString.indexOf('in ')!==0){
         dateString=moment(item.getDueDate()).fromNow();
    }
   
    
}

return dateString;