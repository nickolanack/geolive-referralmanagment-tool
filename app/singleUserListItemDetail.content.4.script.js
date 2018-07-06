if((item.isProjectMember&&item.isProjectMember())){
    return null;
}

if(!item.isDevice){
    if(window.console){
        console.warn('Not a ReferralManagementUser');
    }
    return null;
}


var rolesEditList=<?php
    $editList=GetPlugin('ReferralManagement')->getRolesUserCanEdit();
   echo json_encode($editList);

?>;




var allRoles=<?php

   echo json_encode(GetPlugin('ReferralManagement')->getRoles());

?>;

var itemsMinRoleIndex=Math.min(item.getRoles().map(function(r){return allRoles.indexOf(r)}));
var clientsMinEditRoleIndex=Math.min(rolesEditList.map(function(r){return allRoles.indexOf(r)}));

var roles=allRoles.slice(0)


if(item.isDevice()){
    roles=[roles.pop()];
}

var addEmpty=false;
var foundActive=false;

var module=new ElementModule('ul',{"class":"user-roles"});

if(item.getId()==AppClient.getId()){
    module.runOnceOnLoad(function(){
        module.viewer.getUIView().getElement().addClass('this-is-me');
    });
}

var el=module.getElement();

var itemRoles=item.getRoles();

var els=[];

var userItemIsA=function(r){
    return item.getRoles().indexOf(r)>=0||(r=='none'&&item.getRoles().length==0)
}

var clientCanEditUserRole=function(r){
    return rolesEditList.indexOf(r)>=0||(r=='none'&&rolesEditList.length)
}

var addRole=function(r){
    var roleEl=el.appendChild(new Element('li',{"class":"role-"+r}));
    els.push(roleEl);
    if(userItemIsA(r)){
        foundActive=true
        roleEl.addClass("active");
        el.setAttribute("data-user-role", r);
        el.setAttribute("data-user-role-label", r);
    }
    
    
    var label=r.split('-').join(' ').capitalize();
    var popover=function(text){
         new UIPopover(roleEl,
           {
            description:text,
            anchor:UIPopover.AnchorAuto()
           }); 
    }
    
   
    
    if(clientCanEditUserRole(r)){
        addEmpty=true;
        roleEl.addClass('selectable');
        roleEl.addEvent('click',function(){
            item.setRole(r, function(){
                els.forEach(function(e){
                    e.removeClass("active");
                })
                roleEl.addClass("active");
            });
        });
        
        popover(label+'<br/><span style="color:cornflowerblue;">click to set users role</span>');
     
        
    }else{
        
       popover(label);
        
    }
}

roles.forEach(addRole);
if(addEmpty){
    addRole('none');
}

return module;
//element.appendChild(module);

