
console.log('quick dark mode');

if(window.DashboardConfig){
    DashboardConfig.getValues(['darkMode', 'pageClassNames'],function(values){
        if(window.DisplayTheme){
            DisplayTheme.SetDefaults(values);
        }
    });
}


/**
 * @deprecated 
 */

list.content[0].options.className+="<?php 

$dashConfig=GetWidget('dashboardConfig');
echo $dashConfig->getParameter('darkMode')?' dark':''; 
echo ' '.$dashConfig->getParameter('pageClassNames'); 
?>";