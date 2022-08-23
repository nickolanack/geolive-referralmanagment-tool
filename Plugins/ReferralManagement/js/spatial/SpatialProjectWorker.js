var userFunction = null;

onmessage = function(e) {


    if (!userFunction) {
        userFunction = (new Function('return function(feature, type, options, callback){ ' + "\n" + e.data + "\n" + '}')).call(null);
        return;
    }




    var timeout=setTimeout(function(){

        throw 'Exceeded maximum execution time. 30s';

    }, 30000);

    var handleResult=function(result){

        clearTimeout(timeout)


        handleResult=function(){
            throw 'Already returned data or called callback function';
        }

        postMessage(result);
    };

    var result=userFunction(e.data[0], e.data[0], e.data[0], handleResult);
    if(result){
        handleResult(result);
    }
    
}