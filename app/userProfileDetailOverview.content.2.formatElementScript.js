labelEl.addClass('email-click');
label.addEvent('click', function(){
    
    new Element('a', {
        href:"mailto:"+item.getEmail(),
        target:"blank"
    }).click()
    
    
})