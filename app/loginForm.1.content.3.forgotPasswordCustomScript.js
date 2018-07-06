
var LoginItem=new Class({
    Extends:DataTypeObject,
    Implements:Events,
    setSendMagicLink:function(){
        var me=this;
        me._task="send_magic_link";
    },
    setSendReset:function(){
        var me=this;
        me._task="send_reset";
        
    },
    setEmail:function(e){
        var me=this;
        me._email=e;
    },
    save:function(cb){
        
        var me=this;
        
        (new AjaxControlQuery(CoreAjaxUrlRoot, me._task, {
		  'plugin': "Users",
		  'email':me._email
		})).addEvent('success',function(){
		    cb(true);
		}).execute(); 
		
		

    }
})

application.getDisplayController().displayPopoverForm(
				'forgotPasswordForm', 
				new LoginItem(), 
				application,
				{
				    template:"form"
				}
			);