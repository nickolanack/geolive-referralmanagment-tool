 var b =  UIInteraction.createSectionToggle(function(v) {
    return v instanceof DiscussionModule;	 
 });
 
 console.log('add init');
 b.addEvent('init', function(){
     console.log('set up special behavior')
 });
 
 b.getElement().addClass('some-discussion-toggle');
 
 return b;