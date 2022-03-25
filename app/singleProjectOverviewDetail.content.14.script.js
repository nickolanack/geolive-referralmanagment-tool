 var b =  UIInteraction.createSectionToggle(function(v) {
    return (['discussion-reply']).indexOf(v.getIdentifier())>=0||v instanceof DiscussionModule	 
 });
 
 b.getElement().addClass('some-discussion-toggle');
 
 return b;