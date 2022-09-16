
console.log('quick dark mode');

DashboardConfig.getValues(['darkMode', 'pageClassNames'],function(values){
    console.log(value)
});


list.content[0].options.className+="<?php 

$dashConfig=GetWidget('dashboardConfig');
echo $dashConfig->getParameter('darkMode')?' dark':''; 
echo ' '.$dashConfig->getParameter('pageClassNames'); 
?>";