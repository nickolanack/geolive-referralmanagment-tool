


$config=GetWidget('dashboardConfig');

$parameters['useFontAwesome']=$config->getParameter('useFontAwesome');
$parameters['showFileThumbnails']=$config->getParameter("showFileThumbnails");
$parameters['showUsersRoles']=$config->getParameter("showUsersRoles");
$parameters['showSplitProjectDetail']=$config->getParameter("showSplitProjectDetail");

    
    $menuIconDefault=$config->getParameter('defaultMenuIcon')[0];
    
    
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






    $slackMenuIcon=$config->getParameter('slackMenuIcon', array());
        if(!empty($slackMenuIcon)){
            $slackMenuIcon=$slackMenuIcon[0];
            $slackMenuIcon=json_encode(UrlFrom($slackMenuIcon."?thumb=x>100y>100"));
        }else{
            $slackMenuIcon=false;
        }

    $parameters['slackMenuIcon']=$slackMenuIcon;






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

    $parameters['priorityIcon']=json_encode(UrlFrom($priorityIcon."?tint=rgb(180,180,180)"));
    $parameters['priorityIconTint']=json_encode(UrlFrom($priorityIcon."?tint=".$config->getParameter("priorityTint", "rgb(180,180,180)")));
    $parameters['overdueIcon']=json_encode(UrlFrom($overdueIcon."?tint=rgb(180,180,180)"));
    $parameters['remainingIcon']=json_encode(UrlFrom($remainingIcon."?tint=rgb(180,180,180)"));





return $parameters;