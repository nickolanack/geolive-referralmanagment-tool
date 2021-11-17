var p=new Element('p',{
			"class":"hint",
			"html":''
		});

		p.appendChild(HtmlContent.MakeInfoButtonModule({
			description:'You can approve new site users.'
		}));
		
		return p;