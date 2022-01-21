var button= new ElementModule('button', {
    "class":"form-btn primary-btn share",
    'html':"Create share link",
    events:{click:function(){
        
        (new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_share_link', {
			'plugin': "ReferralManagement"
		})).addEvent('success', function(resp){
		    
		    console.log(resp);
		    
		}).execute();
    
    }}
});

return button;