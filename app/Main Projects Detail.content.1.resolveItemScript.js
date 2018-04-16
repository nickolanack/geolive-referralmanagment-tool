var current=application.getNamedValue("currentProject");    
if(current){
    return current;
}

 var ProposalListQuery = new Class({
            Extends: AjaxControlQuery,
            initialize: function() {
                this.parent(CoreAjaxUrlRoot, 'list_proposals', {
                    plugin: 'ReferralManagement'
                });
            }
        });
        
       (new ProposalListQuery()).addEvent('success',function(resp){
           if(response.results.length==0){
               callback(null);
               return;
           }
           callback(new Proposal(resp.results[0].id, resp.results[0]));
       }).execute();
       
       return null;
       