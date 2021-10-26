return viewer.findChildViews(function(v) {
    return v instanceof TextFieldModule;  				
}).pop().getElement().getSize().y;