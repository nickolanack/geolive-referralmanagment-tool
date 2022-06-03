(new TableHeader('tasktTableLayout', {
       
         "complete": {
            "width": "30px",
            "label": "Complete",
            "showLabel":false,
            "align":"center"
        },
        "stars": {
            "width": "30px",
            "label": "Stars",
            "showLabel":false,
            "align":"center"
        },
         "priority": {
            "width": "30px",
            "label": "Priority",
            "showLabel":false,
            "align":"center"
        },
         "tags": {
            "width": "130px",
            "label": "Project"
        },
         "assigned": {
            "width": "30px",
            "label": "Assigned",
            "showLabel":false,
            "align":"center"
            
        },
        "comments": {
            "width": "45px",
            "tip": "",
            "label": ""
        },
        "name": {
            "width": "auto",
            "minWidth": "250px",
            "label": "Name"
        },
        "duedate": {
            "width": "130px",
            "label": "Due Date"
        }
    
    }
    )).addSort('tags', function(a, b){
        return ProjectList.GetSortFn('name').sortFn(a.getOwnerProject(), b.getOwnerProject());
    }).addSort('duedate', function(a, b){
        return (a.getDueDate() > b.getDueDate() ? 1 : -1);
    }).render(listModule)