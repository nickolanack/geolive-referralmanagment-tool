el.addClass("inline");
el.setAttribute("data-col","created");


valueEl.setAttribute('data-day', item.getCreationDate().split(' ').shift());
valueEl.setAttribute('data-time', item.getCreationDate().split(' ').pop());


valueEl.setAttribute('data-raw', item.getCreationDate());
valueEl.setAttribute('data-fromnow', moment(item.getCreationDate()).fromNow());