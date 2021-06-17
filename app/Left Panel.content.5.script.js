return new ElementModule('div',{
    "class":"application-logo gather-logo gather-icon",
    html:"<?php echo GetWidget('dashboardConfig')->getParameter('gatherLabel'); ?> "+(new Date()).getFullYear()+""})