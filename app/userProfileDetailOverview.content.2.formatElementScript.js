labelEl.addClass('email-click');

if(item.getId()+""==AppClient.getId()+""){
    
    labelEl.addClass("is-you");
    return;
}

labelEl.addEvent('click', function(){
    
    new Element('a', {
        href:"mailto:"+item.getEmail(),
        target:"blank"
    }).click()
    
    
})