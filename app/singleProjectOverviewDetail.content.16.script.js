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
            
            var reply=b.findTargets(function(v){
                return v.getIdentifier()==='discussion-reply';
            });
            console.log(reply);
            var replyView=reply.length>0?reply[0]:null;
            if(replyView){
                replyView.getNamedValue('addNotesButton',function(replyBtn){
                    replyBtn.addEvent('click', function(){
                        b.getElement().addClass('with-reply-box');
                    });
                    b.on('collapse',function(){
                        b.getElement().removeClass('with-reply-box')
                        replyView.getElement().addClass('hide');
                        replyBtn.removeClass('hide');
                    });
                    
                    
                    
                });
               
                
            }
            
            
        });
       
     })
 });
 
 b.getElement().addClass('some-discussion-toggle');
 
 return b;