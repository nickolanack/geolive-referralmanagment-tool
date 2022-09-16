
console.log('quick dark mode');

list.content[0].options.className+="<?php 

$dashConfig=GetWidget('dashboardConfig');
echo $dashConfig->getParameter('darkMode')?' dark':''; 
echo ' '.$dashConfig->getParameter('pageClassNames'); 
?>";