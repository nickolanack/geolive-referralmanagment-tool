var button= new ElementModule('button', {
    "class":"form-btn primary-btn share",
    'html':"Create share link",
    events:{click:function(){
        
        (new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_share_link', {
			'plugin': "ReferralManagement",
			'id':item.getId()
		})).addEvent('success', function(resp){
		    
		    $('theShareLink').href=resp.link;
		    $('theShareLink').innerHTML=resp.link;
		    
		    console.log(resp);
		    
		}).execute();
    
    }}
});

return button;