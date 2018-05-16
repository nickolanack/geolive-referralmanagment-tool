if(item.isTeamManager()){
    checkbox.disabled=true;
    label.appendChild(new Element('p',{html:"user is a manager"}));
}