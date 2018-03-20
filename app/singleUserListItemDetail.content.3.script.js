


var rolesEditList=<?php
    $editList=GetPlugin('ReferralManagement')->getRolesUserCanEdit();
   echo json_encode($editList);

?>;

var selectRole=function(el, role, callback){
    
    <?php 
    if(!empty($editList)){
        
     ?>
     
        var SetUserRoleQuery = new Class({
    		Extends: AjaxControlQuery,
    		initialize: function(user, role) {
    
    			this.parent(CoreAjaxUrlRoot, "set_user_role", {
    				plugin: "ReferralManagement",
    				user: user,
    				role: role
    			});
    		}
    	});     
     
     
        (new SetUserRoleQuery(item.getId(), role)).addEvent('success',function(){
            if(callback){
                callback();
            }
        }).execute();
     
     
     <?php   

    }
    ?>
    
    
}

var roles=<?php

   echo json_encode(GetPlugin('ReferralManagement')->getRoles());

?>;



if(item.isDevice()){
    roles=[roles.pop()];
}

var addEmpty=false;
var foundActive=false;

var module=new ElementModule('ul',{"class":"user-roles"});

if(item.getId()==AppClient.getId()){
    module.addEvent("load:once",function(){
        module.viewer.getUIView().getElement().addClass('this-is-me');
    })
}

var el=module.getElement();

var itemRoles=item.getRoles();
var isEditor=false;
if(itemRoles.length&&rolesEditList.indexOf(itemRoles[0])>=0&&(!item.isAdmin())){
    isEditor=true;
}

<?php
    if(GetClient()->isAdmin()){
        ?>
        isEditor=true;
        <?php
        
    }

?>;

var els=[];

var addRole=function(r){
    var roleEl=el.appendChild(new Element('li',{"class":"role-"+r}));
    els.push(roleEl);
    if(item.getRoles().indexOf(r)>=0||(r=='none'&&item.getRoles().length==0)){
        foundActive=true
        roleEl.addClass("active");
        el.setAttribute("data-user-role", r);
        el.setAttribute("data-user-role-label", r);
    }
    
    
    
    
    
    if(!isEditor){
        
        new UIPopover(roleEl,
           {
            description:r,
            anchor:UIPopover.AnchorAuto()
           }); 
        
        return;
    }
    
    if(rolesEditList.indexOf(r)>=0||(r=='none'&&rolesEditList.length)){
        addEmpty=true;
        roleEl.addClass('selectable');
        roleEl.addEvent('click',function(){
            selectRole(roleEl, r, function(){
                els.forEach(function(e){
                    e.removeClass("active");
                })
                roleEl.addClass("active");
            });
        });
        
        
        new UIPopover(roleEl,
           {
            description:r+'<br/><span style="color:cornflowerblue;">click to set users role</span>',
            anchor:UIPopover.AnchorAuto()
           }); 
        
    }else{
        
        new UIPopover(roleEl,
           {
            description:r,
            anchor:UIPopover.AnchorAuto()
           }); 
        
    }
}

roles.forEach(addRole);
if(addEmpty){
    addRole('none');
}

return module;
//element.appendChild(module);

