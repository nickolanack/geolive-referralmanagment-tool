var ItemPriority=(function(){


	var ItemPriority=new Class({


		isHighPriority: function() {
			var me = this;
			return me.getPriority() == "high";
		},
		getPriority: function() {
			var me = this;
			return me.data.attributes.priority;
		},

		getPriorityNumber: function() {
			var me = this;
			return (["low", "medium", "high"]).indexOf(me.data.attributes.priority);

		},



	});



	ItemPriority.CreatePriorityIndicator=function(item){


		 var mod=new ElementModule('div', {"class":"priority-indicator "+(item.isPriorityTask()?"priority":""), 
		    events:{click:function(e){
		        e.stop();
		        
		        
		        item.setPriority(!item.isPriorityTask());
		        
		        var el=mod.getElement();
		        if(el.hasClass("priority")){
		            el.removeClass("priority")
		        }else{
		            el.addClass("priority")
		        }
		    }}
		    
		});



		return mod;

	};



	return ItemPriority;

}).()