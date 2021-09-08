


$config=GetWidget('dashboardConfig');

$parameters['useFontAwesome']=$config->getParameter('useFontAwesome');
$parameters['showFileThumbnails']=$config->getParameter("showFileThumbnails");
$parameters['showUsersRoles']=$config->getParameter("showUsersRoles");
$parameters['showSplitProjectDetail']=$config->getParameter("showSplitProjectDetail");

    
    $menuIconDefault=$config->getParameter('defaultMenuIcon')[0];
    $parameters['menuIconDefault']=json_encode(UrlFrom($menuIconDefault."?tint=rgb(180,180,180)"));
    
    
    
    
    $mobileIcons=array();
    
    foreach(['apple', 'google'] as $mobile){
        $appIcon=$config->getParameter($mobile.'AppIcon', array());
            if(!empty($appIcon)){
                $mobileIcons[$mobile]=UrlFrom($appIcon[0].'?thumb=x>200y>100');
            }else{
                $mobileIcons[$mobile]=false;
            }
        
    }
    
    $parameters['mobileIcons']=(object) $mobileIcons;
    
    
    $attachmentIcon=$config->getParameter('attachmentIcon', array());
    if(!empty($attachmentIcon)){
        $attachmentIcon=$menuIconDefault;
    }else{
        $attachmentIcon=$attachmentIcon[0];
    }
    
    $parameters['attachmentIcon']=json_encode(UrlFrom($attachmentIcon.
        "?tint=".$config->getParameter("attachmentTint", "rgb(180,180,180)")));
    
    
    
    
    $gatherLogo=$config->getParameter('gatherLogo', array());
        if(empty($gatherLogo)){
            $gatherLogo=$menuIconDefault;
        }else{
            $gatherLogo=$gatherLogo[0];
        }
    $parameters['gatherLogo']=json_encode(UrlFrom($gatherLogo."?thumb=>200x>200"));


    $gatherIcon=$config->getParameter('gatherIcon', array());
        if(empty($gatherIcon)){
            $gatherIcon=$gatherLogo;
        }else{
            $gatherIcon=$gatherIcon[0];
        }
    $parameters['gatherIcon']=json_encode(UrlFrom($gatherIcon."?thumb=>200x>200"));



    $mediaIcons=array();
    foreach(['image', 'document', 'layer', 'audio', 'video'] as $mime){
        $mediaIcon=$config->getParameter($mime.'UploadIcon', array());
            if(empty($mediaIcon)){
                $mediaIcon=$menuIconDefault;
            }else{
                $mediaIcon=$mediaIcon[0];
            }
        $mediaIcons[$mime]=UrlFrom($mediaIcon."?tint=".$config->getParameter("uploadTint", "rgb(180,180,180)"));
    }
    $parameters['mediaIcons']=(object)$mediaIcons;
    
    
    


    $roleIcons=array();
    $roleIconsActive=array();
    foreach(GetPlugin("ReferralManagement")->getRoleIcons() as $role=>$icon){
        
        $roleIcons[$role]=UrlFrom($icon."?grayscale");
        $roleIconsActive[$role]=UrlFrom($icon);
        
    }

    $parameters['roleIcons']=(object)$roleIcons;
    $parameters['roleIconsActive']=(object)$roleIconsActive;

    





    $navIcons=array();
    $navIconsHover=array();
    
    foreach(['prev', 'next'] as $nav){
        $navIcon=$config->getParameter($nav.'NavIcon', array());
        if(empty($navIcon)){
            $navIcon=$menuIconDefault;
        }else{
            $navIcon=$navIcon[0];
        }
        
        $navIcons[$nav]=UrlFrom($navIcon."?tint=".$config->getParameter("uploadTint", "rgb(180,180,180)"));
        $navIconsHover[$nav]=UrlFrom($navIcon."?tint=".$config->getParameter("menuIconTint"));
        
    }

    $parameters['navIcons']=(object)$navIcons;
    $parameters['navIconsHover']=(object)$navIconsHover;

    








    $backgroundImage=$config->getParameter('backgroundImage', array());
        if(!empty($backgroundImage)){
          
            $backgroundImage=$backgroundImage[0];
            $backgroundImage=json_encode(UrlFrom($backgroundImage."?thumb=>200x>200"));
        }else{
            $backgroundImage=false;
        }

        $parameters['backgroundImage']=$backgroundImage;






    $optionsMenuIcon=$config->getParameter('optionsMenuIcon', array());
        if(!empty($optionsMenuIcon)){
          
            $optionsMenuIcon=$optionsMenuIcon[0];
            $optionsMenuIconHover=json_encode(UrlFrom($optionsMenuIcon."?thumb=x>100y>100&tint=".$config->getParameter("menuIconTint")));
            $optionsMenuIcon=json_encode(UrlFrom($optionsMenuIcon."?thumb=x>100y>100&tint=".$config->getParameter("menuIconColor", "rgb(180,180,180)")));
            
        
        }else{
             $optionsMenuIcon=false;
        }

        $parameters['optionsMenuIconHover']=$optionsMenuIconHover;
        $parameters['optionsMenuIcon']=$optionsMenuIcon;




    $slackMenuIcon=$config->getParameter('slackMenuIcon', array());
        if(!empty($slackMenuIcon)){
            $slackMenuIcon=$slackMenuIcon[0];
            $slackMenuIcon=json_encode(UrlFrom($slackMenuIcon."?thumb=x>100y>100"));
        }else{
            $slackMenuIcon=false;
        }

    $parameters['slackMenuIcon']=$slackMenuIcon;



    $surveyMenuIcon=$config->getParameter('surveyMenuIcon', array());
        if(!empty($surveyMenuIcon)){
            $surveyMenuIcon=$surveyMenuIcon[0];
            
            $surveyMenuIconHover=json_encode(UrlFrom($surveyMenuIcon."?thumb=x>100y>100&tint=".
                $config->getParameter("menuIconTint")));
            
            $surveyMenuIcon=json_encode(UrlFrom($surveyMenuIcon."?thumb=x>100y>100&tint=".
                $config->getParameter("menuIconColor", "rgb(180,180,180)")));
            
             $parameters['surveyMenuIconHover']=$surveyMenuIconHover;    
            
        }else{
            $surveyMenuIcon=false;
        }
        
    $parameters['surveyMenuIcon']=$surveyMenuIcon;
    

    $priorityIcon=$config->getParameter('priorityIcon', array());
    if(empty($priorityIcon)){
        $priorityIcon=$menuIconDefault;
    }else{
        $priorityIcon=$priorityIcon[0];
    }

    $overdueIcon=$config->getParameter('overdueIcon', array());
    if(empty($overdueIcon)){
        $overdueIcon=$menuIconDefault;
    }else{
        $overdueIcon=$overdueIcon[0];
    }


    $remainingIcon=$config->getParameter('remainingIcon', array());
    if(empty($remainingIcon)){
        $remainingIcon=$menuIconDefault;
    }else{
        $remainingIcon=$remainingIcon[0];
    }

    
    
    $starredIcon=$config->getParameter('starIcon', array());
        if(empty($starredIcon)){
            $starredIcon=$menuIconDefault;
        }else{
            $starredIcon=$starredIcon[0];
        }



    $parameters['priorityTint']=$config->getParameter("priorityTint", "rgb(180,180,180)");
    $parameters['priorityIcon']=json_encode(UrlFrom($priorityIcon."?tint=rgb(180,180,180)"));
    $parameters['priorityIconTint']=json_encode(UrlFrom($priorityIcon."?tint=".$config->getParameter("priorityTint", "rgb(180,180,180)")));
    
    
    
    $parameters['overdueTint']=$config->getParameter("overdueTint", "rgb(180,180,180)");
    $parameters['overdueIcon']=json_encode(UrlFrom($overdueIcon."?tint=".
        $config->getParameter("overdueTint", "rgb(180,180,180)")));
        
    $parameters['overdueIconSegment']=json_encode(UrlFrom($overdueIcon."?tint=rgba(50,50,50)"));
    $parameters['overdueIconSegmentComplete']=json_encode(UrlFrom($overdueIcon."?tint=rgba(60, 179, 113)"));
    
    
    
    $parameters['remainingTint']=$config->getParameter("remainingTint", "rgb(180,180,180)");
    $parameters['remainingIcon']=json_encode(UrlFrom($remainingIcon."?tint=".
        $config->getParameter("remainingTint", "rgb(180,180,180)")));
        
    $parameters['remainingIconCompleted']=json_encode(UrlFrom($remainingIcon."?tint=rgba(60, 179, 113)"));
    
    $parameters['starredTint']=$config->getParameter("starTint", "rgb(180,180,180)");
    $parameters['starredIcon']=json_encode(UrlFrom($starredIcon."?tint=rgb(180,180,180)"));
    $parameters['starredIconActive']=json_encode(UrlFrom($starredIcon.
        "?tint=".$config->getParameter("starTint", "rgb(180,180,180)")));
    $parameters['starredIconCreated']=json_encode(UrlFrom($starredIcon."?tint=rgba(106, 124, 233)"));





return $parameters;



