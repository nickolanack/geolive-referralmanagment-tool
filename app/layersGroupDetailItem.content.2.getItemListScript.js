return ReferralManagementDashboard.getProjectTagsData(item.getCategory()).filter(function(tag){
    return tag!=item;
});