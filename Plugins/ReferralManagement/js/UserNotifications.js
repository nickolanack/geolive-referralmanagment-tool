var UserNotifications=(function(){

	var UserNotificationsClass=new Class();

	var UserNotifications=new UserNotificationsClass();

	UserNotifications.MakeNotificationBtn=function(){


		var application =ReferralManagementDashboard.getApplication();

		var btns = [
			new ElementModule('span',{
			    "class":"notifications",
			    events:{click:function(){
			        
			        var controller = application.getNamedValue('navigationController');
							controller.navigateTo("Notifications", "Main");
			        
			    }}
			}),
			new ElementModule('span',{
			    "class":"dark-toggle",
			    events:{click:function(){
			       
			       var el=$$('.ui-view.dashboard-main')[0];
			       if(el.hasClass('dark')){
			       		el.removeClass('dark');
			       		return;
			       }
			       el.addClass('dark');
			       
			    }}
			}),
			new ElementModule('span',{
			    "class":"admin-toggle",
			    events:{click:function(){
			        

			    	if(confirm('Are you sure you want to log out')){
			    		AppClient.logout();
			    	}
			        
			    }}
			})
		];

		if(AppClient.getUserType()==='admin'){
			btns.push(new ElementModule('span',{
				    "class":"admin-toggle",
				    events:{click:function(){
				        

				        var el=$$('body')[0];
				       if(el.hasClass('hide-admin')){
				       		el.removeClass('hide-admin');
				       		return;
				       }
				       el.addClass('hide-admin');
				        
				    }}
				}))
		}

		return btns;

	}

	return UserNotifications;


})();