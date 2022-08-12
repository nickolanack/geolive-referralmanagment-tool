

    var application = GatherDashboard.getApplication();
 	var project = application.getNamedValue("currentProject");


    var mod=new ElementModule('div', {"class":"template-data width-2 loading"});
    
    
    mod.getElement().innerHTML='<div class="label top-left"><span class="lbl-txt">Data</span></div>';

    (new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_report_data', {
		  "plugin": "ReferralManagement",
		  "project":project.getId()
    })).addEvent('success',function(resp){
        mod.getElement().removeClass('loading');
        
        mod.getElement().appendChild(new Element('pre', {
            html:JSON.stringify(resp.data, null, '   ')
                 .replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;")
        }));
        
    }).execute();
    
    
    
    
    var toggle=function(){
        
        console.log('hello world');
        
        
    }
    
    mod.getElement().appendChild(new Element('button', {
				"class": "toggle-parameters-form",
				events: {
					click: toggle
				}
			}));
			
	
    
    return mod;
