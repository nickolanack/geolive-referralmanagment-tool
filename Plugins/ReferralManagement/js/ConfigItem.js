var ConfigItem = (function() {

    var ConfigItem = new Class({
        Extends:MockDataTypeItem
    });



    ConfigItem.GetTextBlockModule = function(item) {


        if(!(item instanceof ConfigItem)){

            var user = ProjectTeam.CurrentTeam().getUser(AppClient.getId());
            item=new ConfigItem({
                "className": "section-help section-welcome section-module",
                'heading':`<div class="section-title">
                        <span class="thin">Welcome Back,</span> ` + user.getName() + `
                    </div>`,
                'param':'welcomeText',
                'editLabel':'Edit welcome text',
                'widget':"dashboardContentConfig",
                'form':'textFieldForm'
            });
        }


      


        var div = new Element('div', {
            html: item.getHeading()
            'class': item.getClassName()

        });


        var content = new Element('span', {});
        div.appendChild(content)
        var text = "";
        DashboardConfig.getValue(item.getParam(), function(value) {
            content.innerHTML = value;
            text = value;
        })

        if (!(AppClient.getUserType() == "admin" || ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isTeamManager())) {
            return div;
        }

        div.appendChild(new Element('button', {

            html: "edit",
            'class': 'inline-edit',
            events: {
                click: function() {


                    var configValue = (new MockDataTypeItem({
                        mutable: true,
                        label: item.getEditLabel(),
                        text: text
                    }));

                    configValue.addEvent('save', function() {

                        content.innerHTML = configValue.getText();
                        text = configValue.getText();

                        (new AjaxControlQuery(CoreAjaxUrlRoot, 'set_configuration_field', {
                            "widget": item.getWidget(),
                            "field": {
                                "name": item.getParam(),
                                "value": configValue.getText()
                            }
                        })).execute();


                    });



                    (new UIModalDialog(
                        application,
                        config, {
                            "formName": item.getForm(),
                            "formOptions": {
                                template: "form"
                            }
                        }
                    )).show();

                }
            }

        }));



        return div;


    }



    return ConfigItem;

})()