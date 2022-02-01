el.addClass("inline check");
el.setAttribute("data-col","");

if(item instanceof MissingProject){
    return null;
}

var input=new Element('input', {type:"checkbox", events:{click:function(event){
    event.stopPropagation();
    ProjectSelection.handleSelection(item, this);
}}});

if(ProjectSelection.hasProject(item)){
    input.checked=true;
}

el.appendChild(input)

