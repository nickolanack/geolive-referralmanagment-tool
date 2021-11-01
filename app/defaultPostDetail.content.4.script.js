return new ModuleArray([
        new ElementModule('button', {
            html:"Delete",
            "class":"inline-btn remove"
        }),
         new ElementModule('button', {
            html:"Edit",
            "class":"inline-btn edit"
        })
    ], {identifier:"post-buttons"});