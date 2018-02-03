
var TaskTemplateItem=new Class({
    Extends:TaskItem,
    save:function(cb){
        if(cb){ cb(false); }
    },
    setStarred:function(v, cb){
        if(cb){ cb(false); }
    },
    setPriority:function(v, cb){
        if(cb){ cb(false); }
    }

});



(new AjaxControlQuery(CoreAjaxUrlRoot, 'default_task_templates', {
		                    "plugin": "ReferralManagement",
		                    "proposal":application.getNamedValue("currentProject").getId()
		                })).addEvent('success', function(resp){
		                    
		                    callback(resp.taskTemplates.map(function(data){
		                        return new TaskTemplateItem(application.getNamedValue("currentProject"), data.task);
		                    }));
		                    
		                }).execute();



