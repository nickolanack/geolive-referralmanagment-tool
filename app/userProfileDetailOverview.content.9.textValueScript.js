
var bio=item.getBio();
if(bio&&bio!=""){
    return bio;
}

return "<i>"+(item.getId()==Appclient.getId():"you do":"user does")+" not have a bio</i>"
