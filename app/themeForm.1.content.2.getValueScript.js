(new AjaxControlQuery(CoreAjaxUrlRoot, "get_sass_variables", {
                "widget": "userTheme",
            })).addEvent('success',function(response){
                response.variables.themeName=DashboardLoader.getThemeName()
                callback(JSON.stringify(response.variables, null, '   '));
            }).execute();