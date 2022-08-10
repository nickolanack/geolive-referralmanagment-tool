wizard.on('valueChange', function(){
  var type=wizard.getData().fieldName;
  if(type=='heading'){
      textField.setLabel('Heading Text')
  }
})