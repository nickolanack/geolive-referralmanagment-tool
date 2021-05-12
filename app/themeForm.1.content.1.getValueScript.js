(new AjaxControlQuery(CoreAjaxUrlRoot, "get_sass_variables", {
                "widget": "userTheme",
            })).addEvent('success',function(response){
                callback(JSON.stringify(response.variables, null, '   '));
            })