//return defaultLoginFn;

return function(){
$$('.public-map')[0].setStyle('opacity',0.1);
$$('.public-map')[0].setStyle('pointer-events','none');
$$('.login-form')[0].setStyle('display',null);
$$('.public-menu')[0].setStyle('display',null);
}