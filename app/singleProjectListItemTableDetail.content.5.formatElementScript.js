el.addClass("inline");
el.setAttribute("data-col","modified");

valueEl.setAttribute('data-day', item.getModificationDate().split(' ').shift());
valueEl.setAttribute('data-time', item.getModificationDate().split(' ').pop());

valueEl.setAttribute('data-fromnow', moment(item.getModificationDate()).fromNow());
valueEl.setAttribute('data-raw', item.getModificationDate());