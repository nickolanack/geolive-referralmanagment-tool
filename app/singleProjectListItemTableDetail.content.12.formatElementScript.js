el.addClass("inline check");
el.setAttribute("data-col","");

if(item instanceof MissingProject){
    return null;
}

var pop;

var input=new Element('input', {type:"checkbox", events:{click:function(event){
    event.stopPropagation();
    ProjectSelection.handleSelection(item, this);
    pop.setDescription(input.checked?'click to remove project from selection':'click to add project to selection');
}}});

pop=new UIPopover(el, {
        description:'click to add project to selection',
        anchor:UIPopover.AnchorAuto()
    });

if(ProjectSelection.hasProject(item)){
    input.checked=true;
    pop.setDescription('click to remove project from selection');
}

el.appendChild(input)




