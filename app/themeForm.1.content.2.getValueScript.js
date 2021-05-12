(new AjaxControlQuery(CoreAjaxUrlRoot, "get_content", {
                "widget": "userTheme",
            })).addEvent('success',function(response){
                callback(response.content)
            })