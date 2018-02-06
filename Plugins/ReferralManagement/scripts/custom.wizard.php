<script type="text/javascript">

var ul=new Element('ul', {'class':''});
var li=new Element('li', {'class':'WizardButton disabled', style:'margin: 10px 0;'});
var txt=new Element('span', {'class':'btn-label', html:'preview'});

ul.appendChild(li);
li.appendChild(txt);


var previous=moduleGroup[moduleIndex-1];

var hasFiles=function(){

	if(previous.TextFieldModule){
		var value=previous.TextFieldModule.getValue();

		return value&&(JSTextUtilities.ParseLinks(value).length>0);

	}
	return false;
};

var getFiles=function(){

	return JSTextUtilities.ParseLinks(previous.TextFieldModule.getValue()).map(function(o){
		return o.url;
	});
};

var updateButton=function(){
	if(hasFiles()){
		li.removeClass('disabled');
	}else{
		li.addClass('disabled');
	}
};





li.addEvent('click',function(){
	if(!li.hasClass('disabled')){



		SpatialDocumentPreview.show(getFiles(), wizard, function(){

			wizard.viewer.pushbox.win.setStyle('display', null);
			wizard.viewer.pushbox.overlay.setStyle('display', null);

		});

		wizard.viewer.pushbox.win.setStyle('display', 'none');
		wizard.viewer.pushbox.overlay.setStyle('display', 'none');

	}
});


previous.TextFieldModule.addEvent('change', updateButton);
setTimeout(function(){
	updateButton();
},500)


return ul;

</script>