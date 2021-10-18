return (new ModalFormButtonModule(application, AppClient,{
        label:"Theme",
        formName:"themeForm",
        formOptions:{
            template:"form"
        },
        //hideText:true,
        "class":"primary-btn inline-edit theme-edit",
        styles:{
            position:"relative",
            "z-index":1
        }
    }));