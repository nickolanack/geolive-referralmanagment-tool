<script type="text/javascript">
<?php
/**
 * Community Member
 */
//check is user is a proponent!
Core::LoadPlugin('Attributes');
$attribs=AttributesRecord::GetFields(Core::Client()->getUserId(), 'user', 'isCommunityMember', 'userAttributes');

// if($attribs['isCommunityMember']==='true'){
        ?>

    var container=new Element('div', {'class':"CustomTile"});
    var communityTile=new UIMapTileButton(container,{

        containerClassName:'tileButtonContainer',
        buttonClassName:'tileButton community',
        toolTip:['Community Member', 'access community member content'],
        image:<?php  echo json_encode('http://ReferralManagement.geolive.ca/administrator/components/com_geolive/users_files/user_files_680/Uploads/oFs_X4a_[ImAgE]_[G]_QI0.png'); ?>,
        backgroundImage:<?php 
            echo  json_encode(UrlFrom(Core::WidgetDir().DS.
            'DiscussionMenu'.DS.'images'.DS.'default_tile.png'));
        ?>
    });

    (new UIMapControl(map, {
        element:container,
        anchor:google.maps.ControlPosition["RIGHT_CENTER"]
    })).addControl(); //enable this...

    var communityLayer=null
    communityTile.addEvent('click',function(){

        <?php 



    if(Core::Client()->isGuest()){
        ?>
        MapFactory.LoginWizard(map);
        <?php
    }else{
         ?>
        var zoomTo=function(){

            map.getBaseMap().setZoom(8);
            map.getBaseMap().panTo(new google.maps.LatLng(56.65429286554336,-123.98278027887346));
        }



       
        if(!communityLayer){
            communityLayer = new GeoliveLayer(map, <?php echo json_encode(MapController::LoadLayer(96)->getMetadata());?>);
            zoomTo();
            communityTile.getElement().addClass('active');
        }else{
            
            if(communityLayer.isVisible()){
                communityLayer.hide();
                communityTile.getElement().removeClass('active');
            }else{
                communityLayer.show();
                zoomTo();
                communityTile.getElement().addClass('active');
            }
        }


        

        <?php
      

    }

    ?>

    })

    <?php
//}

/**
 * Proponent
 */
//check is user is a proponent!
Core::LoadPlugin('Attributes');
$attribs=AttributesRecord::GetFields(Core::Client()->getUserId(), 'user', 'isProponent', 'userAttributes');

 //if($attribs['isProponent']==='true'){
        ?>

    var container=new Element('div', {'class':"CustomTile"});
    var proposalTile=new UIMapTileButton(container,{
        containerClassName:'tileButtonContainer',
        buttonClassName:'tileButton proponent',
        toolTip:['New Project Proposal', 'proponents can create and submit proposals'],
        image:<?php  echo json_encode('http://ReferralManagement.geolive.ca/components/com_geolive/users_files/user_files_680/Uploads/7qx_[ImAgE]_[G]_5sS_Itd.png');?>,
        backgroundImage:<?php echo json_encode(UrlFrom(Core::WidgetDir().DS.'DiscussionMenu'.DS.'images'.DS.'default_tile.png'));?>
    });

    var ProposalControl=new UIMapControl(map, {
        element:container,
        anchor:google.maps.ControlPosition["RIGHT_CENTER"]
    });
    ProposalControl.addControl();


    SpatialDocumentPreview.setParentTile(proposalTile, ProposalControl);
    SpatialDocumentPreview.setMap(map);

    proposalTile.addEvent('click',function(){
   
   <?php 

    if(Core::Client()->isGuest()){
        ?>
        MapFactory.LoginWizard(map);
        <?php
    }else{

       

      ?>


        var wizardTemplate = (map.getDisplayController().getWizardTemplate('ProposalTemplate'));
        if ((typeof wizardTemplate) != 'function') {
            throw 'Expecting Proposal Wizard';
        }


        var wizard = wizardTemplate((new Proposal()), {});

        wizard.buildDefaultAndShow();



      <?php 
    }
  ?>

  });





<?php 

/**
 * Lands Department
 */

//check if user is a proponent!
Core::LoadPlugin('Attributes');
$attribs=AttributesRecord::GetFields(Core::Client()->getUserId(), 'user', 'isLandsDepartment', 'userAttributes');

 //if($attribs['isLandsDepartment']==='true'){
    ?>

    var container=new Element('div', {'class':"CustomTile"});
    var landsTile=new UIMapTileButton(container,{
        containerClassName:'tileButtonContainer',
        buttonClassName:'tileButton lands-dept',
        toolTip:['Lands Department', 'access lands department member tools'],
        image:<?php  echo json_encode('http://ReferralManagement.geolive.ca/components/com_geolive/users_files/user_files_680/Uploads/Y40_6sW_[G]_[ImAgE]_Sl0.png');?>,
        backgroundImage:<?php echo json_encode(UrlFrom(Core::WidgetDir().DS.'DiscussionMenu'.DS.'images'.DS.'default_tile.png'));?>
    });

    var Control=new UIMapControl(map, {
        element:container,
        anchor:google.maps.ControlPosition["RIGHT_CENTER"]
    });
    Control.addControl();

    landsTile.addEvent('click',function(){


        <?php 



    if(Core::Client()->isGuest()){
        ?>
        MapFactory.LoginWizard(map);
        <?php
    }else{
         ?>
            
    var tab=map.getNamedValue('EmailerTab');

    if(!tab){
        return;
    }

    tab.menu.showOverlay(tab.overlay);


        <?php
      

    }

    ?>


    });


    <?php
//}
?>



<?php 
/**
 * Register User Group
 */
//check is user is a proponent!
if(!Core::Client()->isGuest()){
    Core::LoadPlugin('Attributes');
    $attribs=AttributesRecord::GetFields(Core::Client()->getUserId(), 'user', array('isLandsDepartment', 'isCommunityMember', 'isProponent'), 'userAttributes');

    if($attribs['isLandsDepartment']!=='true'&&
             $attribs['isCommunityMember']!=='true'&&
             $attribs['isProponent']!=='true'){

        //user is none of above!
      
            $params=Core::LoadPlugin('ReferralManagement')->modalViewParams('selfidentify.form');

      ?>
      //PushBoxWindow.open(<?php echo json_encode($params['url']); ?>, {handler:'iframe'});



        <?php
    }
}

?>




setTimeout(function(){


    var tab=map.getNamedValue('EmailerTab');

    if(!tab){
        return;
    }

//load a bunch of modules
    var module=<?php
    Core::Modules();
    try {
        
        $module = Core::LoadPlugin('ReferralManagement')->loadModule('Proposals', array());
        // die(print_r($module,true));
        if ($module) {
            echo $module->display("map", "map.getNamedValue('EmailerTab')", 'tab', (object) array(
                    'showAdminControls'=>Core::Client()->isAdmin()
                )) . ";";
            ?>
                    module.load(null, tab.content, null);
                    <?php
        } else {
            echo 'null;
                    /*Failed to load Module: widget.' . $this->getInstanceName() . '.UserDetails' . '*/
                    ';
        }
    } catch (Exception $e) {
        print_r($e);
    }
    
    ?>



},1000);




</script>