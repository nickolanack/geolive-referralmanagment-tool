var MobileDeviceList=(function(){


	var MobileDeviceList=new Class({

		getMobileDeviceListInfo:function(){

			return HtmlContent.MakeInfoButtonModule({
				description:"Mobile devices will appear in the list below when they connect to "+window.location.hostname
			});

		}

	});


	return new MobileDeviceList();


})();