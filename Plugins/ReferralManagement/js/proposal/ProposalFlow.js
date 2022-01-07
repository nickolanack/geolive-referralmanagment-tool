var ProposalFlow=(function(){


	var ProposalFlow=new Class({


		initialize:function(definition){




			var content=new Element('div');



			var proponentFlow=content.appendChild(new Element('ul',{"class":"flow"}));

			var last=null;
			var appendStep=function(name, options){
			    
			    var el= proponentFlow.appendChild(new Element('li', options||{}));
			    el.setAttribute('data-label',name);
			    if(last){
			        last.appendChild(new Element('span'));
			    }
			    
			    last=el;
			    return el;
			}

			this._appendStep=appendStep;

			// appendStep("Project submission", {"class":"complete"});
			// appendStep("Validation", {"class":"current mail"});
			// appendStep("Initial Review", {"class":"user"});
			// appendStep("...");
			// appendStep("...");


			this.element = content;




		},

		addStep:function(){

			this._appendStep.call(this, arguments);
			return this;
		},

		getElement:function(){

			return this.element;
		}



	});

	return ProposalFlow;


})()