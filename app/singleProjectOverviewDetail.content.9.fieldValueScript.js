var enabled= DashboardConfig.getValue('enableProposals');
    
    if(!enabled){
        return '';
    }


return ReferralManagementDashboard.getDatesString(item);