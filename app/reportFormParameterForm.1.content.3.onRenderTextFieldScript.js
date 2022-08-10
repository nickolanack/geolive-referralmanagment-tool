var updateField=function(){
  var type=wizard.getData().fieldType;
  if(type=='heading'){
      textField.setLabel('Heading Text')
  }
};

wizard.on('valueChange', updateField);
setTimeout(updateField, 250);