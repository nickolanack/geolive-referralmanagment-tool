wizard.on('valueChange', function(){
  var type=wizard.getData().fieldType;
  if(type=='heading'){
      textField.setLabel('Heading Text')
  }
})