var targetEl=viewer.findChildViews(function(v) {
    return v instanceof DiscussionModule;  				
}).pop().getElement();