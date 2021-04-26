var UserNotifications=(function(){

	var UserNotificationsClass=new Class();

	var UserNotifications=new UserNotificationsClass();

	UserNotifications.MakeNotificationBtn=function(){


		var application =ReferralManagementDashboard.getApplication();

		return new ElementModule('span',{
		    "class":"notifications",
		    events:{click:function(){
		        
		        var controller = application.getNamedValue('navigationController');
						controller.navigateTo("Notifications", "Main");
		        
		    }}
		})

	}

	return UserNotifications;


})();