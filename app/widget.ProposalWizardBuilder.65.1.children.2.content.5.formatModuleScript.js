console.log('listModule')
if(!module.hasWizard()){
    console.error('expected a wizard')
}



    
    setInterval(function(){
            
        var wizards=module.getChildWizards();
        console.log(JSON.stringify(wizards.map(function(wizard){
            return wizard.getData();
        })));
        
    }, 3000);
    
