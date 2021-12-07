labelEl.addClass('email-click');
labelEl.addEvent('click', function(){
    
    new Element('a', {
        href:"mailto:"+item.getEmail(),
        target:"blank"
    }).click()
    
    
})