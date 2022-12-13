var GuestProject = (function() {


	var SaveGuestProjectQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(data) {
			this.parent(CoreAjaxUrlRoot, 'save_guest_project', Object.append({
				plugin: 'ReferralManagement'
			}, (data || {})));
		}
	});


	var GuestProject = new Class({
		Extends: Project,
		save: function(callback) {

			var me = this;
			me.fireEvent("saving");

			if (!me.hasEmail()) {
				(new SaveGuestProjectQuery({
					id: me._id,
					metadata: {},
					attributes: me._attributes || {}
				})).addEvent('success', function(result) {

					if (result.success && result.token) {
						
						me.data.token = result.token;
						me.data.email=me._attributes.proposalAttributes.contactEmail;

						callback(true);
						me.fireEvent("save");

					} else {
						throw 'Failed to save proposal';
					}
				}).execute();

				return;
			}

			(new SaveGuestProjectQuery({
				id: me._id,
				email: me.data.email,
				token: me.data.token
			})).addEvent('success', function(result) {

				if (result.success) {

					callback(true);
					me.fireEvent("save");

				} else {
					throw 'Failed to save proposal';
				}
			}).execute();

		},
		setEmail: function(e) {
			var me = this;
			me.data.email = e;
		},
		hasEmail: function() {
			var me = this;
			return (me.data && me.data.email);
		},
		getEmail:function(){
			return this.data?(this.data.email||""):"";
		},


	});



	GuestProject.CreateGuestProjectButton = function() {


		var application=GatherDashboard.getApplication();

		var proposal = new Element('div', {
			"style": "margin-top: 20px; height: 50px;"
		});

		var loginProposal = proposal.appendChild(new Element('label', {
			html: 'Submit a referral',
			'class': 'login-button-text',
			style: "text-align:left; color: #6A7CE9; line-height: 55px;",
			events: {

			}
		}));

		//login.appendChild(new Element('br'));
		var proposalButton = loginProposal.appendChild(new Element('button', {

			html: 'Add submission',
			style: "background-color:#EDC84C;",
			"class": "primary-btn"

		}));


		var proposalObj = new GuestProposal(-1, {});
		(new UIModalFormButton(proposalButton, application, proposalObj, {

			formOptions: {
				template: "form",
				 "labelForSubmit":"Validate Email",
 	             "labelForCancel":"Cancel",
			},
			formName: "ProposalTemplate",

		})).on('success', function() {

			var modalButton=this;
			var firstWizard=modalButton.getWizard();

			var wizardData=firstWizard.getData();


			(new UIModalDialog(application, proposalObj, {
				formName: 'emailVerificationForm',
				formOptions: {
					template: "form"
				}
			})).on('show',function(){



			}).show().on('close', function(){

				proposalObj = new GuestProposal(-1, {});

			}).on('success', function(){

				(new UIModalDialog(application, "<h2>An activation email has been sent. Please click the link in the email to complete your submission.</h2>You can close this dialog", {
					"formName": "dialogForm",
					"formOptions": {
						"template": "form",
						"className": "alert-view",
						"showCancel":false,
						"labelForSubmit":"Close",
						"labelForCancel":"Cancel",
						"closable":true
					}
				})).on('complete', function(){

				}).show();

			});

		});


		return proposal;


	};


	return GuestProject;


})();

var GuestProposal = GuestProject;



var GuestProjectAmendment = (function() {


	var SaveGuestAmmendmentQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(data) {
			this.parent(CoreAjaxUrlRoot, 'guest_ammend_project', Object.append({
				plugin: 'ReferralManagement'
			}, (data || {})));
		}
	});


	var GuestProjectAmendment = new Class({
		Extends: Project,
		save: function(callback) {

			var me = this;
			me.fireEvent("saving");

			if (!me.hasEmail()) {
				(new SaveGuestAmmendmentQuery({
					id: me._id,
					metadata: {},
					attributes: me._attributes || {}
				})).addEvent('success', function(result) {

					if (result.success && result.token) {
							
						me.data.token = result.token;
						me.data.email=me._attributes.proposalAttributes.contactEmail;

						callback(true);
						me.fireEvent("save");

					} else {
						throw 'Failed to save proposal';
					}
				}).execute();

				return;
			}

			(new SaveGuestAmmendmentQuery({
				id: me._id,
				email: me.data.email,
				token: me.data.token
			})).addEvent('success', function(result) {

				if (result.success) {

					callback(true);
					me.fireEvent("save");

				} else {
					throw 'Failed to save proposal';
				}
			}).execute();

		},
		setEmail: function(e) {
			var me = this;
			me.data.email = e;
		},
		getEmail:function(){
			return this.data?(this.data.email||""):"";
		},
		hasEmail: function() {
			var me = this;
			return (me.data && me.data.email);
		}


	});


	return GuestProjectAmendment;


})();

var GuestProposalAmendment = GuestProjectAmendment;