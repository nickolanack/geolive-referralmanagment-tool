el.addClass("inline priority-item");
//el.setAttribute("data-col","priority");

var priorityEl = el.appendChild(ItemPriority.CreatePriorityIndicator(item));

this.addWeakEvent(item, 'change', this.redraw.bind(this));