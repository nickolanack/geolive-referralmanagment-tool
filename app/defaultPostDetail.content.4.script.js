return new ModuleArray([
        new ElementModule('button', {
            html:"Delete",
            "class":"inline-btn"
        }),
         new ElementModule('button', {
            html:"Edit",
            "class":"inline-btn"
        })
    ], {identifier:"post-buttons"});