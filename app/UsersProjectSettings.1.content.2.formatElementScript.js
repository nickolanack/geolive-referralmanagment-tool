if(item.getId()!==AppClient().getId()){
    checkbox.disabled=true;
    label.appendChild(new Element('p',{html:"only editable by "+item.getName()}));
}