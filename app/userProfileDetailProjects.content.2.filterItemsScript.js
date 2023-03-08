return (ProjectList.currentProjectFilterFn.apply(null, arguments)
&&item.getProjectSubmitterId()+""==application.getNamedValue("currentUser")+"")