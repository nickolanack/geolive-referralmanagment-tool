// var percent=new Element('div');
// var perc=item.getPercentComplete();





// var render=function(perc){
//         percent.setStyle('width', perc+"%");
        
//         if(perc<10){
//             percent.addClass("less-than-10");
//         }else if(perc<50){
//             percent.removeClass("less-than-10");
//             percent.addClass("less-than-50");
            
//         }else{
//             percent.removeClass("less-than-50");
//         }
                
        
//     }
    
//     var div=new Element('div');
    
//     var frameValues=[];
//     for(var i=0;i<=perc/5;i++){
//         frameValues.push((i*5));
//     }
//     if(frameValues[frameValues.length-1]<perc){
//          frameValues.push(perc);
//     }
    
//     var animate=function(){
//         var value=frameValues.shift();
//         render(value);
//         if(frameValues.length){
//             setTimeout(function(){
        
//                 animate(); 
        
//             }, 50);
//         }
//     }
        
//     setTimeout(animate,50);



return new ProgressBarModule({value:function(){ return item.getPercentComplete(); },"class":"percent-complete"});