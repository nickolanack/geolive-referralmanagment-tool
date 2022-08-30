var FormBuilder = (function(){


	var FormBuilder = new Class({




		formatTitleField:function(textField, inputElement, module){

			var wizard=module.getViewer().getUIView().getChildWizard();

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

			  if(type=='heading'){
			  	textField.setLabel('Heading: '+(wizard.getData().defaultValue||wizard.getData().name));
			  }else{
			  	textField.setLabel('Parameter: '+wizard.getData().name);
			  }
			 

			};

			wizard.on('valueChange', updateField);
			setTimeout(updateField, 250);


		},

		formatValueField:function(textField, inputElement, module){

			var wizard=module.getViewer().getUIView().getChildWizard();

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
		},


		formatOptionsField:function(textField, inputElement, module){


			var el=module.getElement();
			var p=el.parentNode;
			p.addClass('minimize');

			var toggle=el.parentNode.appendChild(new Element('button', {"class":"section-toggle", events:{click:function(){
			    if(p.hasClass('minimize')){
			        p.removeClass('minimize');
			        toggle.addClass('active');
			        return;
			    }
			    p.addClass('minimize');
			    toggle.removeClass('active');
			}}}));
		},


		getFormParameter:function(item, wizard){


			var label = item.getName().replace(/([A-Z])/g, " $1");
			label = label[0].toUpperCase() + label.slice(1);

			var parameterName=label.split(' ').map(function(str, i){
				
				if(i==0){
					return str[0].toLowerCase()+(str.length>1?str.slice(1):'');
				}
				return str;

			}).join('');

			var options=item.getOptions();

			if(item.getFieldType()=='heading'){
			    
			    return '<h2>'+item.getDefaultValue()+'</h2>';

			}


			if(item.getFieldType()=='boolean'){
			    
			    return new SimpleBooleanModule({
			        label:label,
			        type:"checkbox",
			        value: (['true', true]).indexOf(item.getDefaultValue())>=0,
			    }).addDataSubmitter(function(object, wizardDataSet){
			        wizardDataSet[parameterName]=object.value;
			    });

			    
			}


			if(item.getFieldType()=='options'){

				var colorMap=false;
				if(options.colorMap){
					colorMap=options.colorMap.slice(0);
				}

			    
			    var tagCloudModule= new SelectableTagCloudModule({
			        label:label,
			        tags:options.values,
			        maxSelected:options.maxSelected||-1
			    }).addDataSubmitter(function(object, wizardDataSet){
			        wizardDataSet[parameterName]=object.value;
			    }).on('addWord',function(word, el){
			    	if(colorMap){

			    		//this assumes that the colorMap array is the same length as all tags 

			    		var colors=colorMap.shift();
			    		Object.keys(colors).forEach(function(k){


			    			var styleStr='--'+k+':'+colors[k]+';';
			    			el.setAttribute('style', (el.getAttribute('style')||"")+' '+styleStr);
			    	
			    		});
			    	}
			    });

			    if(options.showRadioBtns||options.showCheckboxes){

			    	var type='radio';
			    	if(options.showCheckboxes){
			    		//showCheckboxes overrides showRadioBtns
			    		type='checkbox';
			    	}

			    	var btnMap={};

			    	tagCloudModule.on('addWord', function(word, el){
			    		btnMap[word]=el.appendChild(new Element('input', {"type":type}));
			    	});

			    	tagCloudModule.on('onChange', function(words){
			    		Object.keys(btnMap).forEach(function(word){
			    			if(words.indexOf(word)>=0){
			    				btnMap[word].checked=true;
			    				return;
			    			}
			    			btnMap[word].checked=false;
			    		})
			    	})
			    }


			    return tagCloudModule;
			    
			    
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
			        wizardDataSet[parameterName]=object.value;
			    });

			    
			}


			return 'field placeholder'
		}


	});

	return new FormBuilder();

})();