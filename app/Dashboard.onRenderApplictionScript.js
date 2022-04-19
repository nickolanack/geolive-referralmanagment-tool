HtmlDocument()->META(HtmlDocument()->website(), 'base');

IncludeJSBlock('


TemplateModule.SetTemplate(\'form\',\'<div><div data-template="title" class="template-title"></div><div data-template="content" class="template-content"></div><div data-template="footer" class="template-footer"></div></div>\');
TemplateModule.SetTemplate(\'default\',\'<div data-template="content" class="template-content"></div>\');


');

/**
 * Add all views that wont be autoloaded. (any view that is rendered programatically and not by default) 
 */


GetWidget('sharedDashboardTheme')->display($targetInstance);
GetWidget('sharedGeneratedStyles')->display($targetInstance);

GetWidget('emptyListView')->display($targetInstance);

$firelight=GetPlugin('ReferralManagement');
$firelight->includeScripts();


GetWidget('projectTypeSelectionForm')->display($targetInstance); //proposal wizard from map

GetWidget('proposalForm')->display($targetInstance); //proposal wizard from map
GetWidget('permitListForm')->display($targetInstance); //proposal wizard from map



GetWidget('dashboardLoader')->display($targetInstance); //proposal wizard from map


   GetWidget('guestDashboard')->display($targetInstance); 
   GetWidget('loginForm')->display($targetInstance); //login wizard from map
   GetWidget('forgotPasswordForm')->display($targetInstance); //login wizard from map
   
   GetWidget('emailVerificationForm')->display($targetInstance);
   GetWidget('userAboutDetail')->display($targetInstance);
   GetWidget('userForkDetail')->display($targetInstance);
   GetWidget('createDashboardForm')->display($targetInstance);

    GetWidget('projectSearchResult')->display($targetInstance);
   
$dashConfig=GetWidget('dashboardConfig');


IncludeJSBlock('
    
    window.addEvent("load",function(){
        
        var mins=1;
        setInterval(function(){
            var number = Math.random() + "";
           
            (new AjaxControlQuery(CoreContentUrlRoot+"&format=ajax", "echo", {
				random: number
			})).addEvent("success", function(result) {
				
			}).execute();
            
        },mins*60*1000);
        
    });


    '.$targetInstance->getJSObjectName().'.runOnceOnLoad(function(app){
        GatherDashboard.setApplication(app);
        app.getDisplayController().setOptions({
            popoverOptions:{
                parentClassName:"'.($dashConfig->getParameter('darkMode')?' dark':'').' '.
                $dashConfig->getParameter('pageClassNames').'"
            }
        })
        
        NotificationBubble.SetOptions({
            className:"'.($dashConfig->getParameter('darkMode')?' dark':'').' '.
                $dashConfig->getParameter('pageClassNames').'"
        });
        
        
        UIPopover.SetOptions({
            className:"'.($dashConfig->getParameter('darkMode')?' dark':'').' '.
                $dashConfig->getParameter('pageClassNames').'"
        })
        
    });

');



    GetWidget('adminStyles')->display($targetInstance);   
    GetWidget('darkTheme')->display($targetInstance);   
    
    if(strpos($dashConfig->getParameter('pageClassNames'), 'dark')!==false||$dashConfig->getParameter('darkMode')){
        
         
        
    }

    if(strpos($dashConfig->getParameter('pageClassNames'), 'gct3')!==false){
        
        GetWidget('documentProjectForm')->display($targetInstance); //proposal wizard from map
        GetWidget('documentForm')->display($targetInstance); //proposal wizard from map
        

        
         GetWidget('gct3Theme')->display($targetInstance);  
         GetWidget('purpleTheme')->display($targetInstance);   
    }else{
         GetWidget('gatherTheme')->display($targetInstance);   
    }
    
    
    if($dashConfig->getParameter('useFontAwesome')){
        GetWidget('fontAwesomeIcons')->display($targetInstance);   
    }
    
    
GetWidget('mainNotificationsDetail')->display($targetInstance); //proposal wizard from map
    
GetWidget('defaultPostDetail')->display($targetInstance);
    
GetWidget('communityMemberDashboard')->display($targetInstance); 

GetWidget('nonMemberDashboard')->display($targetInstance); 

GetWidget('datasetSelectForm')->display($targetInstance); 


GetWidget('singleProjectListItemTableDetail')->display($targetInstance);
GetWidget('departmentsDetail')->display($targetInstance);
GetWidget('departmentForm')->display($targetInstance);
GetWidget('tagsDetail')->display($targetInstance);
GetWidget('tagForm')->display($targetInstance);

GetWidget('userProfileDetail')->display($targetInstance);

GetWidget('userProfileDetailProjects')->display($targetInstance);

GetWidget('usersCombinedDetail')->display($targetInstance);

GetWidget('splitProjectDetail')->display($targetInstance);
GetWidget('groupListsProjectDetail')->display($targetInstance);


GetWidget('documentProjectDetail')->display($targetInstance);



//GetWidget('mainDashboardRecentDetail')->display($targetInstance)t;

GetWidget('mainActivityDetail')->display($targetInstance);
GetWidget('mainProjectsDetail')->display($targetInstance);
GetWidget('mainTasksDetail')->display($targetInstance);
GetWidget('mainCalendarDetail')->display($targetInstance);
GetWidget('mainMapDetail')->display($targetInstance);

GetWidget('mainDocumentsDetail')->display($targetInstance);
GetWidget('mainTimeTrackingDetail')->display($targetInstance);
GetWidget('mainReportsDetail')->display($targetInstance);
GetWidget('mainMessagesDetail')->display($targetInstance);

GetWidget('communitySelectionForm')->display($targetInstance);



GetWidget('peopleProjectMembersDetail')->display($targetInstance);
GetWidget('peopleClientsDetail')->display($targetInstance);
GetWidget('peopleUsersDetail')->display($targetInstance);

GetWidget('UsersProjectSettings')->display($targetInstance);

GetWidget('importProjectsForm')->display($targetInstance);


GetWidget('communityCulturalDetail')->display($targetInstance);
GetWidget('communityTransportationDetail')->display($targetInstance);
GetWidget('communityHabitationDetail')->display($targetInstance);
GetWidget('communityEnvironmentalDetail')->display($targetInstance);
GetWidget('communitySubsistenceDetail')->display($targetInstance);

GetWidget('communityUsersDetail')->display($targetInstance);
GetWidget('communityMobileDetail')->display($targetInstance);


GetWidget('configurationArchiveDetail')->display($targetInstance);
GetWidget('configurationSettingsDetail')->display($targetInstance);

GetWidget('singleTeamListItemDetail')->display($targetInstance);
GetWidget('singleFileListItemDetail')->display($targetInstance);
GetWidget('singleFilesSectionDetail')->display($targetInstance);



GetWidget('taskForm')->display($targetInstance); //proposal wizard
GetWidget('taskDefaultItems')->display($targetInstance);
GetWidget('userProfileForm')->display($targetInstance);
GetWidget('changePassword')->display($targetInstance);

GetWidget('userSelectionForm')->display($targetInstance);
GetWidget('selectableUserListItemDetail')->display($targetInstance);

GetWidget('filesListForm')->display($targetInstance);
GetWidget('shareLink')->display($targetInstance);


GetWidget('emptyProjectOverviewDetail')->display($targetInstance);
GetWidget('emptyTasksList')->display($targetInstance);
GetWidget('chooseProjectTypeForm')->display($targetInstance);


GetWidget('fileItemForm')->display($targetInstance);

GetWidget('singleUserSmallIconDetail')->display($targetInstance);

GetWidget('landsDepartmentMemberForm')->display($targetInstance);

GetWidget('taskDetailPopover')->display($targetInstance);
GetWidget('singleTaskOverviewDetail')->display($targetInstance);
GetWidget('userInviteForm')->display($targetInstance);


GetWidget('dialogForm')->display($targetInstance);
GetWidget('textFieldForm')->display($targetInstance);

GetWidget('layerGroupForm')->display($targetInstance);
GetWidget('mainMapDetailLayers')->display($targetInstance);
GetWidget('themeForm')->display($targetInstance);

GetWidget('defaultTasksForm')->display($targetInstance);
GetWidget('baseMapForm')->display($targetInstance);

GetWidget('discussionMediaPostForm')->display($targetInstance);

GetWidget('singleProjectHistoryDetail')->display($targetInstance);
GetWidget('userProfileDetailActivity')->display($targetInstance);

GetWidget('proposalOverviewStatus')->display($targetInstance);
GetWidget('singleProjectProponentDetail')->display($targetInstance);
GetWidget('singleProjectBriefingDetail')->display($targetInstance);
GetWidget('singleProjectReviewDetail')->display($targetInstance);




GetWidget('defaultPostDetail')->display($targetInstance);