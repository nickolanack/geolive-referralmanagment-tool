 var b =  UIInteraction.createSectionToggle(function(v) {
    return v instanceof DiscussionModule;	 
 });
 
 console.log('add init');
 b.addEvent('init', function(){
     b.getFirst().getDiscussion(function(discussion){
        discussion.onStarted(function(){
            if(discussion.numberOfPosts()==0){
                b.getElement().addClass('empty-notes');
                discussion.once('addPosts',function(){
                   b.getElement().removeClass('empty-notes');
                });
            }     
        });
       
     })
 });
 
 b.getElement().addClass('some-discussion-toggle');
 
 return b;