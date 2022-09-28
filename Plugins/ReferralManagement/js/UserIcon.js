var UserIcon=(function(){

	var UserIcon=new Class({


		createUserAvatarModule:function(item, defaultIcon) {


			/*

				Use the following in a Custom Module!		

				var defaultIcon=<?php 
				    echo json_encode(UrlFrom(GetWidget('dashboardConfig')->getParameter('defaultUserImage')[0])); 
				?>;


				return ReferralManagementDashboard.createUserIcon(item, defaultIcon);


			 */


			var div = new ElementModule('div', {
				"class": "content user-profile-icon for-user-" + ((item.getUserId || item.getId).bind(item)())
			});
			var span = new Element('span');
			div.appendChild(span);


			if (defaultIcon) {
				span.setStyles({
					"background-image": "url(" + defaultIcon + ")"
				});
				div.getElement().addClass('default-icon');
			}


			if(item.getMetadata){
				var meta=item.getMetadata();
				if(meta.accessToken){
					div.getElement().addClass('access-token');
				}
			}




			var setItemOnlineStatus = function() {
				var el = div.getElement().parentNode;
				el.removeClass('is-online');
				el.removeClass('is-offline');
				el.removeClass('is-unknown');

				var user = item;

				if (!(item instanceof DashboardUser)) {
					if (ProjectTeam.CurrentTeam().hasUser((item.getUserId || item.getId).bind(item)())) {
						user = ProjectTeam.CurrentTeam().getUser((item.getUserId || item.getId).bind(item)())
					} else {
						return;
					}
				}

				if (!user.showsOnline()) {
					el.addClass('is-unknown');
					return;
				}

				if (user.isOnline()) {
					el.addClass('is-online');
					return;
				}

				el.addClass('is-offline');



			}
			//setItemOnlineStatus();

			div.runOnceOnLoad(function() {
				div.addWeakEvent(item, 'onlineStatusChanged', setItemOnlineStatus);
				setItemOnlineStatus();
			});




			if (ProjectTeam.CurrentTeam().hasUser((item.getUserId || item.getId).bind(item)())) {


				UIInteraction.addUserProfileClick(div.getElement(), item);

				var icon = ProjectTeam.CurrentTeam().getUser((item.getUserId || item.getId).bind(item)()).getProfileIcon();

				if(icon&&icon!=defaultIcon){
					if (icon.indexOf('Uploads') > 0) {
						icon = icon + "?thumb=>170x>170";
					}

					div.getElement().removeClass('default-icon');
					span.setStyle("background-image", "url(" + icon + ")");
				}
				return div;

			}


			if(!item.getUserId){
				//console.error('todo: fix invalid user')
				return div;

			}

			(new GetAttributeItemValueQuery(item.getUserId(), AppClient.getType(), "userAttributes", "profileIcon")).addEvent("success", function(result) {


				if (result.value) {
					var urls = Proposal.ParseHtmlUrls(result.value);
					span.setStyle("background-image", "url(" + urls[0] + ")");
				}


			}).execute();


			return div;


		}



	});


	return new UserIcon();


})();