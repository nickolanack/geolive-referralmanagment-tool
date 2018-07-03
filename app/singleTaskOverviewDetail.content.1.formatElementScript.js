el.addClass('item-title')

el.addClass(item.isComplete()?"complete":(item.isOverdue()?"overdue":"incomplete"));