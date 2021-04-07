var HtmlContent=(function(){





	var HtmlContent=new Class({


	});



	HtmlContent.MakeInfoButtonModule=function(options){

			var container=new Element('div', "")

			var info=new Element('div' , {"class":"info-button"});
			new UIPopover(info, Object.append({anchor:UIPopover.AnchorAuto()}, options);
			container.appendChild(info);


			return container;

	}


	return HtmlContent;



})();