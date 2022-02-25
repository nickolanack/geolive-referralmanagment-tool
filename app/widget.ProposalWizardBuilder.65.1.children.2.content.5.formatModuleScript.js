console.log('listModule')
if(!module.hasWizard()){
    console.error('expected a wizard')
}



    
    setTimeout(function(){
            
        var wizards=module.getChildWizards();
        wizards.forEach(function(wizard){
                
            
            wizard.addEvent('valueChange', function(){

                console.log(JSON.stringify(wizards.map(function(wizard){
                    wizard.update();
                    return wizard.getData();
                })));
                
            })
            
        })
        
        
        
    }, 3000);
    
