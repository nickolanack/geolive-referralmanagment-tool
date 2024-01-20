 var value = item.getText(callback);
 if(typeof value=="string"){
     return value;
 }
 
  if(typeof value=="function"){
     value= value(callback);
     if(typeof value=="string"){
         return value;
     }
 }