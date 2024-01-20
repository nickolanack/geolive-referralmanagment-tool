
// var fitSticky=function(){
    
//   var bar = $$('.ui-view.search-panel')[0];
//   var frame=$$('.ui-view.main-panel')[0];
   
//   if(bar&&frame){
//       bar.setStyle('width', frame.getSize().x+'px');
//   }
    
// }
// window.addEvent('resize', fitSticky);
// fitSticky();

$$('.dashboard-main')[0].addClass('sticky-top');
$$('.dashboard-main')[0].addEvent('scroll', function(){
   if(this.getScroll().y>10){
       this.addClass('scrolled');
       return;
   }
   this.removeClass('scrolled');
});