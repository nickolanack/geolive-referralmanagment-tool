var el=childView.getElement();
var color=new Element('span', {"class":"tag-color"});
el.appendChild(color);
color.setStyle('background-color', child.getColor());


if(child.getColor){
    childView.getElement().style.setProperty('--theme-color', child.getColor());
    childView.getElement().style.setProperty('--theme-color-light', child.getColor()+'55');
    childView.getElement().style.setProperty('--theme-color-hover', child.getColor()+'66');
}