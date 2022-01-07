var ProposalFlow=(function(){


	var ProposalFlow=new Class({


		initialize:function(definition){




			var content=new Element('div');



			var proponentFlow=content.appendChild(new Element('ul',{"class":"flow"}));

			var last=null;


			var els=[];

			var appendStep=function(name, options){
			    
			    var el= proponentFlow.appendChild(new Element('li', options||{}));
			    el.setAttribute('data-label',name);
			    if(last){
			        last.appendChild(new Element('span'));
			    }
			    

			    els.push(el);
			    last=el;

			    if(options.clickable!==false){
			    	el.addClass('clickable');
				    el.addEvent('click', function(){

				    	if(options.unclickable===true){
				    		el.removeClass('clickable');
				    		el.removeEvents('click');
				    	}

				    	var index=els.indexOf(el);
				    	els.forEach(function(e,i){
				    		if(i<index){
				    			e.removeClass('current');
				    			e.addClass('complete');
				    		}
				    		if(i>index){
				    			e.removeClass('current');
				    			e.removeClass('complete');
				    		}

				    	})
				    	el.addClass('current');
				    });
				}

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

			this._appendStep.apply(this, arguments);
			return this;
		},

		getElement:function(){

			return this.element;
		}



	});

	return ProposalFlow;


})()