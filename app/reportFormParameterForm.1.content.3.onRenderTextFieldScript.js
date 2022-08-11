var updateField=function(){
  var type=wizard.getData().fieldType;
  if(type=='heading'){
      textField.setLabel('Heading Text')
  }
  
  if(type=='script'){
      textField.setLabel('Script')
  }
  
  if((['heading', 'script']).indexOf(type)>=0){
      module.getElement().removeClass('width-2')
  }
  
};

wizard.on('valueChange', updateField);
setTimeout(updateField, 250);