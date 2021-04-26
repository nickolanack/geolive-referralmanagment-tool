el.addClass("inline");
el.setAttribute("data-col","selection");

if(ProjectSelection.hasProject(item)){
    input.checked=true;
}

var input=el.appendChild(new Element('input', {type:"checkbox", events:{click:function(event){
    event.stopPropagation();
    ProjectSelection.handleSelection(item, this);
}}}))

