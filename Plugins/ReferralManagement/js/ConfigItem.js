var ConfigItem = (function() {


    /**
     * Use config items to display some configuration text, with admin edit buttons
     */


    var ConfigItem = new Class({
        Extends: MockDataTypeItem
    });

    ConfigItem.WelcomeText=function(){
        
        var user = ProjectTeam.CurrentTeam().getUser(AppClient.getId());

        return ConfigItem.GetTextBlockModule(new ConfigItem({
            "className": "section-help section-welcome section-module",
            'heading': '<div class="section-title"> <span class="thin">Welcome Back,</span> ' + user.getName() + ' </div>',
            'param': 'welcomeText',
            'editLabel': 'Edit welcome text',
            'widget': "dashboardContentConfig",
            'form': 'textFieldForm'
        }),{
            "userAuth":true
        });
    }



    ConfigItem.GetTextBlockModule = function(item, options) {


        if (!(item instanceof ConfigItem) && (!options) && item.userAuth) {
            options = item;
        }

        options = Object.append({
            userAuth: false
        }, options);


        if (!(item instanceof ConfigItem)) {

            throw 'Expected ConfigItem';
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

        var user = ProjectTeam.CurrentTeam().getUser(AppClient.getId());
        if (!(user.isTeamManager()&&user.getCommunity() === UserGroups.GetCollective())) {
            return div;
        }


        var btn=ConfigItem.CreateEditBtn(item, options);
        if(btn){
            div.appendChild(btn);
        }


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

        var btn = new Element('button', {

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
                        stepOptions:item.getStepOptions?item.getStepOptions(item):null
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

        });

        new UIPopover(btn,{
            description:item.getEditLabel(),
            anchor:UIPopover.AnchorAuto()
        });


        return btn;
    }



    return ConfigItem;

})()