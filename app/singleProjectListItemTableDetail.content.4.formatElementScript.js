el.addClass("inline");
el.setAttribute("data-col","created");


valueEl.setAttribute('data-day', item.getCreationDate().split(' ').shift());
valueEl.setAttribute('data-time', item.getCreationDate().split(' ').pop());