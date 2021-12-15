childView.getElement().addEvent('click', function(e){
   e.stop();//Propagation()
    UIInteraction.navigateToCompany(child);
});