var ItemStatus = (function() {


	var ItemStatus = new Class({


		getProjectStatus:function(){


			if(this.data.attributes.stateData){

				if(typeof this.data.attributes.stateData=='string'&&this.data.attributes.stateData[0]=='{'){
					this.data.attributes.stateData=JSON.parse(this.data.attributes.stateData);
				}

				if(isObject_(this.data.attributes.stateData)){

					var types=[]

					var status=this.data.attributes.stateData;
					if(status.processing>=0){
						types.push(this.getFlowNames('processing')[status.processing]);
					}

					if(status.assessment>=0){
						types.push(this.getFlowNames('assessment')[status.assessment]);
					}

					return types;
				}
			}

			return ['Intake'];

			// return [
			// 	'Filing', 'Monitoring'
			// ]
		},

		getFlowNames:function(name){
			var states={
				processing:['Intake', 'Filing', 'Tasking', 'Briefing', 'Tracking'],
				assessment:['Quality Assessment', 'Prioritization', 'Meeting schedules', 'Dispute resolution', 'Reporting','Monitoring']
			};
			return states[name];
		},

		getProponentFlow:function(){


			return (new ProposalFlow('proponent',this))
			    .addStep("Submission", {"class":"current", "clickable":false})
			    .addStep("Validation", {"class":"mail"})
			    .addStep("Office Review", {"class":"user"})
			    .addStep("Assessments")
			    .addStep("Outcome");
			    //.getElement();

		},
		getProcessingFlow:function(){


			return (new ProposalFlow('processing',this))
			    
			    .addStep("Intake", {"class":"current mail"})
			    .addStep("Filing", {"class":"user"})
			    .addStep("Tasking", {"class":"user"})
			    .addStep("Briefing")
			    .addStep("Tracking",{completable:false});
			    //.getElement();

		},
		getAssessmentFlow:function(){


			return (new ProposalFlow('assessment',this))
			
			    .addStep("Quality Assessment", {"class":"current user", "completes":{"proponent":"validation"}})
			    .addStep("Prioritization", {"class":"mail"})
			    .addStep("Meeting schedules", {"class":"user"})
			    .addStep("Dispute resolution")
			    .addStep("Reporting")
			    .addStep("Monitoring",{"ongoing":true});
			   // .getElement();

		}

	});


	ItemStatus.AddTags = function(item, el, valueEl) {




		var types = item.getProjectStatus();
		
		var plainTag = new NamedCategory({
			name: "",
			shortName: "",
			description: "",
			type: "Status.tag",
			id: -1,
			color: "#f0f0f0",
			category: "_"
		});



		valueEl.innerHTML = types[0];
		RecentItems.colorizeEl(valueEl, types[0], plainTag);
		el.addEvent('click', function(e) {
			e.stop(); //Propagation()
			UIInteraction.navigateToNamedStatusType(types[0]);
		});


		var others = types.slice(1);
		if (others.length > 0) {
			// var othersEl = el.appendChild(new Element('span', {
			// 	"class": "field-value not-tag",
			// 	"html": '' + others.length + ' other' + (others.length == 1 ? '' : 's')

			// }));

			//var content = new Element('div');
			//var textContent='';

			types.slice(1).forEach(function(type, i) {


				var tag = el.appendChild(new Element('span', {
					"class": "field-value"
				}));

				//tag.innerHTML=type;
				RecentItems.colorizeEl(tag, type, plainTag);
				tag.addEvent('click', function(e) {
					e.stop(); //Propagation()
					UIInteraction.navigateToNamedStatusType(type);
				});

				tag.innerHTML = type;


			});

			// new UIPopover(othersEl, {
			// 	content: content,
			// 	anchor: UIPopover.AnchorAuto(),
			// 	clickable: true
			// });

		}



	};


	return ItemStatus;


})();