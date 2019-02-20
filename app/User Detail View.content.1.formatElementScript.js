/* turn the entire element (el) into a form button*/
new UIModalFormButton(el.parentNode, application, item, {"formName":"userProfileForm", "formOptions":{template:"form"}});
el.addClass('editable');

el.appendChild(new Element('button', {"html":"logout", "events":{"click":function(){AppClient.logout();}}}));