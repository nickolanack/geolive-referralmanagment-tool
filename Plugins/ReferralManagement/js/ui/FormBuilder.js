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


		}








	});

	return new FormBuilder();

})();