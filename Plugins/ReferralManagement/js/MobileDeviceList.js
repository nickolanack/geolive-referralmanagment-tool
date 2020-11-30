var MobileDeviceList=(function(){


	var MobileDeviceList=new Class({

		getMobileDeviceListInfo:function(){


			var menu=new Element('div', "")

			var info=new Element('div' , {"class":"info-button"});
			new UIPopover(info, {description:"Mobile devices will appear in the list below when they connect to "+window.location.hostname, anchor:UIPopover.AnchorAuto()});
			menu.appendChild(info);

			/*
			var settings=new Element('div' , {"class":"info-button settings"});
			//new UIPopover(div, {description:"A simple description", anchor:UIPopover.AnchorAuto()});
			menu.appendChild(settings);

			*/

			return menu;

		}

	});


	return new MobileDeviceList();


})();