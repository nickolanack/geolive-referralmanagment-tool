if(item.getId()<=0||(!item.isArchived())){
    return null;
}

return new Element('button',{"html":"Delete", "class":"primary-btn error remove", "events":{"click":function(){
    
    
    if (confirm('Are you sure you want to delete this proposal?')) {


var DeleteProposalQuery = new Class({
            Extends: AjaxControlQuery,
            initialize: function(id) {
                this.parent(CoreAjaxUrlRoot, 'delete_proposal', {
                    plugin: 'ReferralManagement',
                    id: id
                });
            }
        });



                                (new DeleteProposalQuery(item.getId())).addEvent('success', function() {
                            
                                ProjectTeam.CurrentTeam().removeProject(item);
                                application.getNamedValue('navigationController').navigateTo("Dashboard","Main");
                                    
                                }).execute();

                            }
    
    
    

}}})