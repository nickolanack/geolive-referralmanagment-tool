el.addClass("inline");
el.setAttribute("data-col","selection");

el.appendChild(new Element('input', {type:"checkbox", events:{click:function(event){
    event.stopPropagation();
    ProjectSelection.handleSelection(item, this);
}}}))