


var projectsLabel="Projects";

if(item instanceof ProjectList){
    projectsLabel=item.getLabel();
}


return '<div class="section-title section-padding" data-identifier="htmlLabel"><span>'+projectsLabel+'</span></div>'