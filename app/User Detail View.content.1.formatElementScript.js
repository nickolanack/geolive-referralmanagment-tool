/* turn the entire element (el) into a form button*/
new UIModalFormButton(el.parentNode, application, item, {"formName":"userProfileForm", "formOptions":{template:"form"}});
el.addClass('editable');

el.appendChild(new Element('button', {"class":"inline-logout","html":"logout", "events":{"click":function(){AppClient.logout();}}}));