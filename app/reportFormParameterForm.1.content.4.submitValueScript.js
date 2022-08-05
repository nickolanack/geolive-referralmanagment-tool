try{
    var options=JSON.parse(object.value);
wizardDataSet.options=options;
}catch(e){
    console.error(e);
}