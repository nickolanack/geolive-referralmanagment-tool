if((!value)||value==""){
    object.value= item.getName();
    if(object._module){
        object._module.setValue(object.value);
    }
}
