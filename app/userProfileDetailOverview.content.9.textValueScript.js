
var bio=item.getBio();
if(bio&&bio!=""){
    return bio;
}

return "<i>"+(item.getId()==AppClient.getId()?"you do":"user does")+" not have a bio</i>"
