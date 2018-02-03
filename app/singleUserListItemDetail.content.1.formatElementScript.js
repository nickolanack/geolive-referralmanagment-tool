new UIModalFormButton(el, application, item, {"formName":"userProfileForm", "formOptions":{template:"form"}});


if(el.previousSibling){
    new UIModalFormButton(el.previousSibling, application, item, {"formName":"userProfileForm", "formOptions":{template:"form"}});
}