var el=childView.getElement();
var color=new Element('span', {"class":"tag-color"});
el.appendChild(color);
color.setStyle('background-color', child.getColor());