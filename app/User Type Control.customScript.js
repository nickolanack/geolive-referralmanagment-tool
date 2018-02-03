var ul = container.appendChild(new Element('ul',{'class':'user-role-display', events:{click:function(){

var wizardTemplate = (map.getDisplayController().getWizardTemplate('UserTemplate'));
                            if ((typeof wizardTemplate) != 'function') {
                                throw 'Expecting Proposal Wizard';
                            }

                            var wizard = wizardTemplate(map, {});

                            wizard.buildDefaultAndShow();

}}}));


var li;
<?php 


if(Auth('memberof', 'community-member', 'group')){

?>
li = ul.appendChild(new Element('li'));
li.appendChild(new Asset.image('https://firelight.geolive.ca/components/com_geolive/users_files/user_files_680/Uploads/[ImAgE]_oIv_Umn_[G]_WsM.png'));
<?php
}


if(Auth('memberof', 'lands-department', 'group')){

?>
li = ul.appendChild(new Element('li'));
li.appendChild(new Asset.image('https://firelight.geolive.ca/components/com_geolive/users_files/user_files_680/Uploads/lpZ_1F4_6nd_[ImAgE]_[G].png'));
<?php
}

if(Auth('memberof', 'proponent', 'group')){


?>
li = ul.appendChild(new Element('li'));
li.appendChild(new Asset.image('https://firelight.geolive.ca/components/com_geolive/users_files/user_files_680/Uploads/[G]_gVG_[ImAgE]_Dn_kmf.png'));
<?php
}








if(Auth('memberof', 'no-role', 'group')){


?>
li = ul.appendChild(new Element('li'));
li.appendChild(new Asset.image('https://firelight.geolive.ca/components/com_geolive/users_files/user_files_680/Uploads/[G]_gVG_[ImAgE]_Dn_kmf.png'));
<?php
}
?>