el.addClass("inline");
el.setAttribute("data-col","created");


el.setAttribute('data-day', item.getCreationDate().split(' ').shift());
el.setAttribute('data-time', item.getCreationDate().split(' ').pop());