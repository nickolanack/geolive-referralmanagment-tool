if(value&&wizardDataSet.dueDate){
    wizardDataSet.dueDate=wizardDataSet.dueDate.split(" ")[0]+" "+value;
}else{
     wizardDataSet.dueDate="00-00-00 00:00:00";
}
