if(!DashboardConfig.getValue('showSplitProjectDetail')){
        list.content=list.content.slice(0,1);
        list.content[0].options.className=list.content[0].options.className.split(' ').slice(0,-1).join(' ');
        
    }