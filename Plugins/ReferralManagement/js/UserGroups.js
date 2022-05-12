var UserGroups = (function() {

	var UserGroups = new Class({});




	var MainRoles;


	(new AjaxControlQuery(CoreAjaxUrlRoot, 'get_user_roles', {
		'plugin': "ReferralManagement"
	}))
	.addEvent('success', function(result) {
			console.log(result);
			MainRoles = result.roles;
		})
		.execute();


	UserGroups.GetAllRoles = function() {
		 


		var disabed = DashboardConfig.getValue('disabledRoles');

		return MainRoles.filter(function(r){

			if (disabed && disabed.indexOf(r) >= 0) {
				return false;
			}
			return true;

		});
		
	};


	UserGroups.GetCommunityMemberRole = function() {
		return "community-member"
	}

	UserGroups.GetTeamMemberRoles = function() {
		var roles = UserGroups.GetAllRoles();
		roles.pop();
		return roles;
	}

	UserGroups.GetAdminRole = function() {
		var roles = UserGroups.GetAllRoles();
		return roles.shift();
	}

	UserGroups.GetManagerRoles = function() {
		var roles = UserGroups.GetAllRoles();
		roles.pop();
		roles.pop();
		return roles;
	}



	UserGroups.GetTeams = function() {
		return Community.teams;
	}


	UserGroups.GetSubgroups = function() {
		return Community.territories.map(function(name) {
			return String_.capitalize.call(null, name)
		});
	}

	UserGroups.Localize=function(name){
		return String_.capitalize.call(null, name.split('|').pop());
	}

	UserGroups.GetSubgroupsLocalized = function() {


		return Community.territories.map(function(name) {
			return String_.capitalize.call(null, name.split('|').pop());
		})
	}

	UserGroups.GetCollective = function() {
		return Community.collective;
	}


	UserGroups.AllGroups = function() {
		return Community.communities;
	}

	UserGroups.EmptyGroup = function() {
		return "none";
	}

	UserGroups.IsEmptyGroup = function(group) {
		return group.toLowerCase() === UserGroups.EmptyGroup();
	}


	UserGroups.ClientCanEditItemsInGroup = function(group) {
		return (UserGroups.GetGroupsWhereClientHasEdit().indexOf(group) >= 0);
	};

	UserGroups.GetGroupsWhereClientHasEdit = function() {



		var user = ProjectTeam.CurrentTeam().getUser(AppClient.getId());

		var community = user.getCommunity();

		if (community === UserGroups.GetCollective()) {
			return UserGroups.AllGroups();
		}

		return [community];

	};



	UserGroups.GetRoleSelectionModules = function(item) {
		if ((item.isProjectMember && item.isProjectMember())) {
			return null;
		}

		if (!item.isDevice) {
			if (window.console) {
				console.warn('Not a DashboardUser');
			}
			return null;
		}


		var rolesEditList = ProjectTeam.GetRolesUserCanAssign();
		var allRoles = ProjectTeam.GetAllRoles();

		var itemsMinRoleIndex = Math.min.apply(null, item.getRoles().map(function(r) {
			return allRoles.indexOf(r)
		}));
		var clientsMinEditRoleIndex = Math.min.apply(null, rolesEditList.map(function(r) {
			return allRoles.indexOf(r)
		}));


		var addEmpty = false;
		var foundActive = false;

		var module = new ElementModule('ul', {
			"class": "user-roles hover"
		});

		if (item.getId() == AppClient.getId()) {
			module.runOnceOnLoad(function() {
				module.viewer.getUIView().getElement().addClass('this-is-me');
			});
		}

		var el = module.getElement();

		var itemRoles = item.getRoles();

		var els = [];

		var userItemIsA = function(r) {
			return item.getRoles().indexOf(r) >= 0 || (r == 'none' && item.getRoles().length == 0)
		}

		var clientCanEditUserRole = function(r) {
			return ((rolesEditList.indexOf(r) >= 0 && clientsMinEditRoleIndex <= itemsMinRoleIndex) || (r == UserGroups.EmptyGroup() && rolesEditList.length));
		}

		var clientCanEditUserCommunity = function() {
			return UserGroups.ClientCanEditItemsInGroup(item.getCommunity());
		}

		var clientHasNoCommunity = function() {
			return UserGroups.IsEmptyGroup(item.getCommunity());
		}



		var addRole = function(r) {


			var disabed = DashboardConfig.getValue('disabledRoles');
			if (disabed && disabed.indexOf(r) >= 0) {
				return;
			}

			var roleEl = el.appendChild(new Element('li', {
				"class": "role-" + r
			}));
			els.push(roleEl);
			if (userItemIsA(r)) {
				foundActive = true
				roleEl.addClass("active");
				el.setAttribute("data-user-role", r);
				el.setAttribute("data-user-role-label", r);
			}


			var label = ReferralManagementDashboard.getLabelForUserRole(r);
			var popover = function(text) {
				new UIPopover(roleEl, {
					description: text,
					anchor: UIPopover.AnchorAuto()
				});
			}


			if (clientHasNoCommunity()) {
				popover(label + '<br/><span style="color:#ceb250;">users community must be set before<br/>thier user role can be changed</span>');
				return;
			}

			if (!clientCanEditUserCommunity()) {
				popover(label + '<br/><span style="color:#ceb250;">you do not have permission<br/>to set user roles for this community</span>');
				return;
			}



			if (!clientCanEditUserRole(r)) {
				popover(label + '<br/><span style="color:#ceb250;">you do not have permission<br/>to set users role</span>');
				return;
			}



			addEmpty = true;
			roleEl.addClass('selectable');
			roleEl.addEvent('click', function() {
				item.setRole(r, function() {
					els.forEach(function(e) {
						e.removeClass("active");
					})
					roleEl.addClass("active");
				});
			});

			popover(label + '<br/><span style="color:cornflowerblue;">click to set users role</span>');



		}


		var roles = ProjectTeam.GetAllRoles().slice(0);
		if (item.isDevice()) {
			roles = [roles.pop()];
		}

		roles.forEach(addRole);
		if (addEmpty) {
			addRole('none');
		}

		return module;

	};


	UserGroups.PendingCommunityInformation = function() {

		var p=new Element('p',{
			"class":"hint",
			"html":""
		});

		p.appendChild(HtmlContent.MakeInfoButtonModule({
			description:'You can approve new site users.'
		}));
		
		return p;

	}


	UserGroups.UserInvitationBtn=function(options){


		var userInvite=(new MockDataTypeItem({
            mutable: true,
            name: '',
            email:''
        }));


        var InviteRequest=new Class_({
            Extends:AjaxControlQuery,
            initialize:function(credentials){
                this.parent(FrameworkCMSAjaxUrlRoot, "invite", credentials);
            }
        });

        userInvite.addEvent('save',function(){

        	(new InviteRequest({
                	name:userInvite.getName(),
                	email:userInvite.getEmail(),
                	'plugin':"Users"
                }).addEvent("onSuccess",function(response){
                        
                	if(response.error){
                        NotificationBubble.Make(response.error);
                    }

                        if(response.success&&response.subscription){

                            var container=new Element("div", {"class":"progress"});

                            (new UITaskProgressSubscription(container, response)).addEvent("complete",function(){
                            	
                            })
                            return;
                        }

                    })).execute();


        });


		return new ModalFormButtonModule(GatherDashboard.getApplication(), userInvite, ObjectAppend_({
		        label:"Invite User",
		        formName:"userInviteForm",
		        formOptions:{
		            template:"form"
		        },
		        //hideText:true,
		        "class":"primary-btn"
		    }, options));

	}

	UserGroups.ClientRoleInformation = function() {

		var title = ""

		var text="";
		if (AppClient.getUserType() === "admin") {
			text = text + "You are a Site Administrator so you can see all " + ReferralManagementDashboard.getLabelForMember() + "s from all communities (and set user roles). The following description of your role would apply if you were a regular user. <br/>"
		}


		var user = ProjectTeam.CurrentTeam().getUser(AppClient.getId());

		if (user.isTeamManager()) {


			var usersCommunities = "`" + user.getCommunity()+"`";
			if (user.getCommunity() != UserGroups.GetCollective()) {
				usersCommunities += " and `"+UserGroups.GetCollective()+"`";
			}



			text = text + "You are a " + ReferralManagementDashboard.getLabelForManager() + ". " +
				"You can see the " + ReferralManagementDashboard.getLabelForMember() + "s in your community, " + usersCommunities + ", as well as " + ReferralManagementDashboard.getLabelForManager() + "s accross communities. " +
				"<br/>You can share individual projects with other communities by adding a " + ReferralManagementDashboard.getLabelForManager() + " from another community to a specific project, (There are other ways to collaborate)." +
				"<br/> You can asign users to the following roles: " +
				(user.getRolesUserCanAssign().map(function(r) {
					return '`' + ReferralManagementDashboard.getLabelForUserRole(r) + '`';
				}).join(', ')) + '. As long as they are in your community, and have a lower role than `' + ReferralManagementDashboard.getLabelForUserRole(user.getRole()) + '`';
		} else {
			text = text + "You are a " + ReferralManagementDashboard.getLabelForMember() + ". " +
				"You can see other lands department members in your own community, `" + user.getCommunity() + "` and `wabun`. ";
		}



		
		var p=new Element('p',{
			"class":"hint",
			"html":title
		});

		p.appendChild(HtmlContent.MakeInfoButtonModule({
			description:text
		}));


		return p;

		//HtmlContent.MakeInfoButtonModule();
		//return "<p class=\"hint\">" + title+text + "</p>";
	};



	return UserGroups;


})();