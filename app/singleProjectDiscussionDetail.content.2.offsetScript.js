return viewer.findChildViews(function(v) {
    return v instanceof UIViewModule;  				
}).pop().getElement().getSize().y+5;