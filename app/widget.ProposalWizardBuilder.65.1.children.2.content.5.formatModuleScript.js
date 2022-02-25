console.log('listModule')
if(!module.hasWizard()){
    console.error('expected a wizard')
}


var updateFn=function(){
     
    var wizardData=module.getChildWizards().map(function(wizard){
        wizard.update();
        return wizard.getData();
    });
    
    console.log(JSON.stringify(wizardData));
    
    wizardData.forEach(function(data, i){
        
        
        var removeList=[];
        if(Object.keys(data).filter(function(k){
            return data[k]!==false;
        }).length===0){
            if(i<wizardData.length-2){
                removeList.push(i);
            }
        }else{
            if(i==wizardData.length-1){
                module.addItem(new MockDataTypeItem({
                    id:-1,
                    type:item.getType()
                }))
            }
        }
        
        
        removeList.reverse().forEach(function(i){
            module.getDetailViewAt(i).remove();
        });
        
    })
     
}

    
    
            
        var wizards=module.getChildWizards();
        wizards.forEach(function(wizard){
            wizard.addEvent('valueChange', function(){
                updateFn();
            });
        });
        
        module.addEvent('addItem',function(child, childView){
            childView.getChildWizard(function(wizard){
                wizard.addEvent('valueChange', function(){
                    updateFn();
                });
            });
        });
        
        
        
   
    
