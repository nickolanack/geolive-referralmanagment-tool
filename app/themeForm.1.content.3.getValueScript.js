(new AjaxControlQuery(CoreAjaxUrlRoot, "generate_css", {
                "widget": "userTheme",
                variables:JSON.parse(item.getContent())
            })).addEvent('success',function(response){
                callback(response.content)
            }).execute();