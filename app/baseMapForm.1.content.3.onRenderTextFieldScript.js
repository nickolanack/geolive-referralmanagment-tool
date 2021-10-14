
textField.options.listValues=ProjectDepartmentList.getProjectDepartments().map(function(d){return d.getName();});
textField.options.listTemplate.bind(textField)(inputElement, null);