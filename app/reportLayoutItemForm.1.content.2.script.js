var modules = new ModuleArray([
    new ModalFormButtonModule(application, item, {

			label: "Edit Content",
			formOptions: {
				template: "form"
			},
			formName: 'reportContentForm',
			"class": "primary-btn report",
            stopPropagation:true

	}).addEvent('show',function(childWizard){
	    childWizard.addEvent('complete',function(){
	        //trigger parent wizard update
	        modules.fireEvent('change');
	    });
	}),
	new ModalFormButtonModule(application, item, {

			label: "Edit Form/Config",
			formOptions: {
				template: "form"
			},
			formName: 'reportOptionsForm',
			"class": "primary-btn report",
            stopPropagation:true

	}).addEvent('show',function(childWizard){
	    childWizard.addEvent('complete',function(){
	        //trigger parent wizard update
	        modules.fireEvent('change');
	    });
	}),
	
    new ElementModule('button', {
            "html":"",
			"class": "primary-btn inline-edit download",
            events:{
                click:function(e){
                    console.log(item);
                    
                    
                    var download=function(filename, text) {
                      var element = new Element('a', {style:"display:none;"});
                      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                      element.setAttribute('download', filename);
                    
                      element.style.display = 'none';
                      document.body.appendChild(element);
                    
                      element.click();
                    
                      document.body.removeChild(element);
                    }
                    
                    download(item.getName()+".json", JSON.stringify(item.toObject(), null, '  '));
                    
                                        
                    
                    
                }
            }
            

	}),
	
	new ElementModule('button', {
            "html":"",
			"class": "primary-btn inline-edit edit",
            events:{
                click:function(e){
                    
                    
                    var configValue = (new MockDataTypeItem({
                        mutable: true,
                        label: "Edit Template Data",
                        text: JSON.stringify(item.toObject(), null, '  '),
                        stepOptions:null
                    }));
                    
                    
                    configValue.addEvent('save', function() {
                        
                            var data=JSON.parse(configValue.getText());
                            
                            item.setName(data.name);
                            item.setDescription(data.description);
                            item.setContent(data.content);
                            item.setParameters(data.parameters);
                           
                            
                    });
                    
                    (new UIModalDialog(
                        GatherDashboard.getApplication(),
                        configValue, {
                            "formName": 'textFieldForm',
                            "formOptions": {
                                template: "form",
                                "labelForSubmit":"Update Field",
                                "labelForCancel":"Cancel",
                            }
                        }
                    )).show();
                                  
                }
            }
            

	})
	
]);



return modules;