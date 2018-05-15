if((item.isProjectMember&&item.isProjectMember())){
    return null;
}


var rolesEditList=<?php
    $editList=GetPlugin('ReferralManagement')->getRolesUserCanEdit();
   echo json_encode($editList);

?>;


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
    module.runOnceOnLoad(function(){
        module.viewer.getUIView().getElement().addClass('this-is-me');
    });
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
    
    
    var label=r.split('-').join(' ').capitalize();
    var popover=function(text){
         new UIPopover(roleEl,
           {
            description:text,
            anchor:UIPopover.AnchorAuto()
           }); 
    }
    
    if(!isEditor){
        
       popover(label);
        
        return;
    }
    
    if(rolesEditList.indexOf(r)>=0||(r=='none'&&rolesEditList.length)){
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

