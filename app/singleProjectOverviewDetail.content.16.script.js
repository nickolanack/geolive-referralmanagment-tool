 var b =  UIInteraction.createSectionToggle(function(v) {
    return v instanceof DiscussionModule;	 
 });
 
 b.getElement().addClass('some-discussion-toggle');
 
 return b;