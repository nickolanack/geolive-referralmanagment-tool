 var value= localStorage.getItem('myTheme');
if(typeof value=="string"&&value.indexOf('{')>=0){
     return value;
 }
 
 return `{
    "color1Example":"black"
 }`