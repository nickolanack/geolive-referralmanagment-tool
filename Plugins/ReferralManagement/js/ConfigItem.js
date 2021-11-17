var ConfigItem = (function() {

    var ConfigItem = new Class({
        Extends: MockDataTypeItem
    });



    ConfigItem.GetTextBlockModule = function(item, options) {


        if (!(item instanceof ConfigItem) && (!options) && item.userAuth) {
            options = item;
        }

        options = Object.append({
            userAuth: false
        }, options);


        if (!(item instanceof ConfigItem)) {

            var user = ProjectTeam.CurrentTeam().getUser(AppClient.getId());
            item = new ConfigItem({
                "className": "section-help section-welcome section-module",
                'heading': `<div class="section-title">
                        <span class="thin">Welcome Back,</span> ` + user.getName() + `
                    </div>`,
                'param': 'welcomeText',
                'editLabel': 'Edit welcome text',
                'widget': "dashboardContentConfig",
                'form': 'textFieldForm'
            });
        }



        var div = new Element('div', {
            html: item.getHeading(),
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
                        text: text,

                    }));

                    configValue.addEvent('save', function() {

                        content.innerHTML = configValue.getText();
                        text = configValue.getText();

                        (new AjaxControlQuery(CoreAjaxUrlRoot, (options.userAuth ? 'user_' : '') + 'set_configuration_field', {
                            "widget": item.getWidget(),
                            "field": {
                                "name": item.getParam(),
                                "value": configValue.getText()
                            }
                        })).execute();


                    });



                    (new UIModalDialog(
                        ReferralManagementDashboard.getApplication(),
                        configValue, {
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


    ConfigItem.CreateEditBtn = function(item, options, callback) {


        if (!(item instanceof ConfigItem) && (!options) && item.userAuth) {
            options = item;
        }

        if (typeof options == "function") {
            callback = options;
            options = {};
        }


        options = Object.append({
            userAuth: false
        }, options);

        return new Element('button', {

            html: "edit",
            'class': 'inline-edit',
            events: {
                click: function() {

                    var prefix = (options.userAuth ? 'user_' : '')
                    var getMethod = prefix + 'get_raw';
                    var setMethod = prefix + 'set_template';

                    if (item.getParam) {
                        getMethod = 'get_configuration_field'; //no user method
                        setMethod = prefix + 'set_configuration_field';
                    }


                    var configValue = (new MockDataTypeItem({
                        mutable: true,
                        label: item.getEditLabel(),
                        text: item.getText ? item.getText() : function(callback) {

                            (new AjaxControlQuery(CoreAjaxUrlRoot, getMethod, {
                                "widget": item.getWidget(),
                                "field": item.getParam?item.getParam():null
                            })).addEvent('success', function(resp) {
                                callback(resp.template||resp.value);
                            }).execute();

                        },
                        stepOptions:item.getStepOptions?item.getStepOptions.bind(item):null
                    }));

                    configValue.addEvent('save', function() {

                        //content.innerHTML = configValue.getText();
                        //text = configValue.getText();


                        (new AjaxControlQuery(CoreAjaxUrlRoot, setMethod, {
                            "widget": item.getWidget(),
                            "field": item.getParam?{
                                "name": item.getParam(),
                                "value": configValue.getText()
                            }:null,
                            'content':configValue.getText()
                        })).execute();


                    });



                    (new UIModalDialog(
                        ReferralManagementDashboard.getApplication(),
                        configValue, {
                            "formName": item.getForm(),
                            "formOptions": {
                                template: "form"
                            }
                        }
                    )).show();

                }
            }

        })
    }



    return ConfigItem;

})()