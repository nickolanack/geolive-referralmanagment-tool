(new TableHeader('tasktTableLayout', {
       
         "complete": {
            "width": "30px",
            "label": "Complete",
            "showLabel":false
        },
        "stars": {
            "width": "30px",
            "label": "Stars",
            "showLabel":false
        },
         "priority": {
            "width": "30px",
            "label": "Priority",
            "showLabel":false
        },
         "tags": {
            "width": "130px",
            "label": "Project"
        },
         "assigned": {
            "width": "30px",
            "label": ""
            
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
    
})).render(listModule);