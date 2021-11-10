//return defaultLoginFn;

return function(){
$$('.public-map').setStyle('opacity',0.1);
$$('.public-map').setStyle('pointer-events','none');
$$('.login-form').setStyle('display',null);
$$('.public-menu').setStyle('display',null);
}