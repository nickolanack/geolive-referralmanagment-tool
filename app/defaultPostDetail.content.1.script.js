
var defaultIcon=<?php 
    echo json_encode(UrlFrom(GetWidget('dashboardConfig')->getParameter('defaultUserImage')[0])); 
?>;


return ReferralManagementDashboard.createUserIcon(item, defaultIcon);

