ProjectList.AddTableHeader(module).addLayoutOptions({
    "icon": {
        "hidden": true
    },
    "selection": {
        "hidden": true
    },
    "priority": {
        "width": "30px",
        "align": "center",
        "tip": "",
        "label": "Priority",
        "showLabel": false
    },
    "id": {
        "width": "50px",
        "label": "ID",
        "align": "center",
        "tip": "These IDs are automatically assigned"
    },
    "auth": {
        "hidden": true
    },
    "created": {
        "width": "auto",
        "maxWidth": "180px",
        "label": "Created",
        "hidden": true,
        "collapseAt": "55px"
    },
    "name": {
        "width": "auto",
        "minWidth": "250px",
        "label": "Name"
    },
    "user": {
        "width": "auto",
        "maxWidth": "250px",
        "label": "Created By",
        "collapseAt": "70px"
    },
    "type": {
        "width": "auto",
        "maxWidth": "250px",
        "label": "Type",
        "collapseAt": "120px"
    },
    "keywords": {
        "hidden": true
    },
    "modified": {
        "hidden": true
    },
    "security": {
        "hidden": true
    },
    "sharing": {
        "hidden": true
    },
    "public": {
        "hidden": true
    },
    "attachments": {
        "hidden": true
    },
    "community": {
        "hidden": true
    },
    "status": {
        "hidden": true
    }
});

module.setPaginationOptions({
    position:"auto",
    showPages:true
});
new TableAutoHeightBehavior(module, {});