var FormBuilder = (function(){


	var FormBuilder=new Class({




		formatTitleField:function(textField, inputElement, module){


			var last=null;
			var updateField=function(){
			  var type=wizard.getData().fieldType;
			  if(['heading'].indexOf(type>=0)){
			      var el=module.getElement().parentNode.parentNode.parentNode;
			      if(last){
			          el.removeClass(last);
			      }
			      last='type-'+type;
			      el.addClass(last);
			  }
			};

			wizard.on('valueChange', updateField);
			setTimeout(updateField, 250);


		},





		getFormParameter:function(item){


			var label = item.getName().replace(/([A-Z])/g, " $1");
			label = label[0].toUpperCase() + label.slice(1);


			if(item.getFieldType()=='heading'){
			    
			    return '<h2>'+item.getDefaultValue()+'</h2>';

			}


			if(item.getFieldType()=='boolean'){
			    
			    return new SimpleBooleanModule({
			        label:label,
			        type:"checkbox",
			        value: (['true', true]).indexOf(item.getDefaultValue())>=0,
			    }).addDataSubmitter(function(object, wizardDataSet){
			        wizardDataSet[item.getName()]=object.value;
			    });

			    
			}


			if(item.getFieldType()=='options'){
			    
			    return new SelectableTagCloudModule({
			        label:label,
			        tags:item.getOptions().values,
			        maxSelected:item.getOptions().maxSelected||-1
			    }).addDataSubmitter(function(object, wizardDataSet){
			        wizardDataSet[item.getName()]=object.value;
			    });
			    
			    
			}


			if(item.getFieldType()=='script'){
			    return eval("(function(){\n"+item.getDefaultValue()+"\n})();");
			}



			if(item.getFieldType()=='parameters'){
			   
			    wizard.appendData(JSON.parse(item.getDefaultValue()));
			    return null;
			}


			if(item.getFieldType()=='text'){
			    
			    return new TextFieldModule({
			       label:label,
			       wrapElementClassName:"no-media",
			       value:item.getDefaultValue()||"",
			    }).addDataSubmitter(function(object, wizardDataSet){
			        wizardDataSet[item.getName()]=object.value;
			    });

			    
			}


			return 'field placeholder'
		}


	});

	return new FormBuilder();

})();