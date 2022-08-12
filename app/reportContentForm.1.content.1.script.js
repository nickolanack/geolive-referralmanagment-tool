

    var application = GatherDashboard.getApplication();
 	var project = application.getNamedValue("currentProject");


    var mod=new ElementModule('div', {"class":"template-data width-2 loading"});
    
    
    mod.getElement().innerHTML='<div class="label top-left"><span class="lbl-txt">Data</span></div>';
    var content=new Element('div', {"class":"pre-content"});
    mod.getElement().appendChild(content);

    (new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_report_data', {
		  "plugin": "ReferralManagement",
		  "project":project.getId()
    })).addEvent('success',function(resp){
        mod.getElement().removeClass('loading');
        
        content.appendChild(new Element('pre', {
            html:JSON.stringify(resp.data, null, '   ')
                 .replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;")
        }));
        
    }).execute();
    
    
    
    
    var toggle=function(){
        
        var el=mod.getElement();
        var next=el.nextSibling;
        
        if(el.hasClass('collapse')){
            
            el.removeClass('collapse');
            next.removeClass('expand');
            return;
        }
        
        el.addClass('collapse');
        next.addClass('expand');
        
        
    }
    
    
    mod.runOnceOnLoad(function(){
        setTimeout(toggle, 250);
    })
    
    mod.getElement().appendChild(new Element('button', {
				"class": "toggle-parameters-form",
				events: {
					click: toggle
				}
			}));
			
	
    
    return mod;
