console.log('listModule')
if(!module.hasWizard()){
    console.error('expected a wizard')
}


module.getChildWizard(function(subWizard){
    
    setInterval(function(){
        console.log(subWizard.getData());
    }, 3000)
    
})